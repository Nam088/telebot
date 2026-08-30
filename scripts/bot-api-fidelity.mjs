#!/usr/bin/env node
/**
 * Field-level fidelity audit: compares every Bot API type the three packages
 * declare against the field tables in the documentation oracle
 * (`scripts/bot-api-docs.mjs`) and reports
 *
 *   (a) concrete documented types the package does not model at all, and
 *   (b) for each modelled type, which documented fields are missing, split
 *       into MISSING-REQUIRED and missing-optional.
 *
 * A missing required field is the serious one: the field is always present on
 * the wire, so the object simply cannot be decoded correctly. That case fails
 * the build (exit 1) unless `--report` is passed.
 *
 * Field names are mapped back to wire keys per package:
 *
 * - node    interface property keys under `packages/node/src`, already snake_case.
 * - go      struct `json:"..."` tags under `packages/go/pkg`.
 * - python  dataclass attribute names under `packages/python/src/telebot_py/types`,
 *           plus that class's `_KEY_OVERRIDES` (e.g. `from_user` -> `from`).
 *
 * Usage:
 *   node scripts/bot-api-fidelity.mjs --report
 *   node scripts/bot-api-fidelity.mjs --package go
 *   node scripts/bot-api-fidelity.mjs --oracle path/to/oracle.json
 *
 * Zero dependencies: Node 22+ built-ins only, per the repo NFR-1 policy.
 *
 * @module
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { DOCS_URL, REPO_ROOT, formatCounts, oraclePath, parseDocs } from './bot-api-docs.mjs';

/**
 * Replaces the contents of comments and string literals with spaces while
 * preserving line structure, so structural regexes cannot be fooled by markup
 * living inside a doc comment or a docstring.
 *
 * This matters more than it looks: the Python `Message` docstring lists every
 * field under an `Attributes:` section in text that is otherwise identical to a
 * real field declaration, and the TypeScript interfaces carry a one-line doc
 * comment above every property.
 *
 * @param {string} source File text.
 * @param {{hashComments?: boolean, templateLiterals?: boolean, keepStrings?: boolean}} [options]
 *   `hashComments` selects `#` comments and triple-quoted strings (Python);
 *   `templateLiterals` decides whether backticks open a string (TypeScript yes,
 *   Go no); `keepStrings` skips over string bodies without blanking them, which
 *   Go needs because a struct tag *is* the data being read.
 * @returns {string} Same length and same line breaks, with comments/strings blanked.
 */
export function maskCommentsAndStrings(source, options = {}) {
  const { hashComments = false, templateLiterals = true, keepStrings = false } = options;
  const out = source.split('');

  const blank = (from, to) => {
    for (let i = from; i < to && i < out.length; i += 1) {
      if (out[i] !== '\n') out[i] = ' ';
    }
  };

  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (hashComments) {
      if (ch === '#') {
        let end = source.indexOf('\n', i);
        if (end === -1) end = source.length;
        blank(i, end);
        i = end;
        continue;
      }
      if ((ch === '"' || ch === "'") && source.startsWith(ch.repeat(3), i)) {
        const fence = ch.repeat(3);
        let end = source.indexOf(fence, i + 3);
        // Backslash escapes work inside triple quotes; honour them so an
        // embedded quote does not close the docstring early.
        while (end !== -1 && source[end - 1] === '\\') {
          end = source.indexOf(fence, end + 3);
        }
        blank(i, end === -1 ? source.length : end + 3);
        i = end === -1 ? source.length : end + 3;
        continue;
      }
    } else {
      if (ch === '/' && next === '/') {
        let end = source.indexOf('\n', i);
        if (end === -1) end = source.length;
        blank(i, end);
        i = end;
        continue;
      }
      if (ch === '/' && next === '*') {
        let end = source.indexOf('*/', i + 2);
        blank(i, end === -1 ? source.length : end + 2);
        i = end === -1 ? source.length : end + 2;
        continue;
      }
    }

    if (ch === '"' || ch === "'" || (templateLiterals && ch === '`')) {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === ch) break;
        // A raw newline ends an ordinary string but not a template literal.
        if (source[j] === '\n' && ch !== '`') break;
        j += 1;
      }
      if (keepStrings) {
        i = Math.min(j + 1, source.length);
        continue;
      }
      blank(i + 1, j);
      i = Math.min(j + 1, source.length);
      continue;
    }

    i += 1;
  }
  return out.join('');
}

/**
 * Index of the brace that closes the block opened at `open`.
 *
 * @param {string} text Masked source text.
 * @param {number} open Index of the opening brace.
 * @returns {number} Index of the matching `}`, or -1 when unbalanced.
 */
function matchBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Net bracket/brace/paren delta of one line. */
function bracketDelta(line) {
  const opened = (line.match(/[{[(]/g) || []).length;
  const closed = (line.match(/[}\])]/g) || []).length;
  return opened - closed;
}

/**
 * Parses `export interface X { ... }` declarations into wire-key sets.
 *
 * Only depth-0 property keys inside the body count, so nested object literals
 * and index signatures are never mistaken for Bot API fields.
 *
 * @param {string} masked Masked file text.
 * @returns {Array<{name: string, fields: Set<string>}>} One entry per interface.
 */
export function extractTypeScript(masked) {
  const declarations = [];
  const re = /^export\s+(?:declare\s+)?interface\s+([A-Za-z_$][\w$]*)[^{]*\{/gm;
  let match;
  while ((match = re.exec(masked)) !== null) {
    const open = match.index + match[0].length - 1;
    const close = matchBrace(masked, open);
    if (close === -1) break;
    const fields = new Set();
    let depth = 0;
    for (const line of masked.slice(open + 1, close).split('\n')) {
      if (depth === 0) {
        const key = /^(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/.exec(line.trim());
        if (key) fields.add(key[1]);
      }
      depth = Math.max(0, depth + bracketDelta(line));
    }
    declarations.push({ name: match[1], fields });
    re.lastIndex = close;
  }
  return declarations;
}

/**
 * Parses `type X struct { ... }` declarations into wire-key sets.
 *
 * The `json:"..."` tag is authoritative. An untagged field falls back to the
 * lower-cased Go name, which is what `encoding/json` matches case-insensitively.
 *
 * @param {string} masked Masked file text.
 * @returns {Array<{name: string, fields: Set<string>}>} One entry per struct.
 */
export function extractGo(masked) {
  const declarations = [];
  const re = /^type\s+([A-Z]\w*)\s+struct\s*\{/gm;
  let match;
  while ((match = re.exec(masked)) !== null) {
    const open = match.index + match[0].length - 1;
    const close = matchBrace(masked, open);
    if (close === -1) break;
    const fields = new Set();
    for (const line of masked.slice(open + 1, close).split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '') continue;
      const tag = /json:"([^"]*)"/.exec(trimmed);
      if (tag) {
        const key = tag[1].split(',')[0];
        if (key !== '' && key !== '-') fields.add(key);
        continue;
      }
      const named = /^([A-Za-z_]\w*)/.exec(trimmed);
      if (named) fields.add(named[1].toLowerCase());
    }
    declarations.push({ name: match[1], fields });
    re.lastIndex = close;
  }
  return declarations;
}

/**
 * Parses `class X(...):` bodies into wire-key sets.
 *
 * A field is a 4-space-indented `name: annotation` line at bracket depth 0, so
 * wrapped annotations and nested blocks are handled. The class's own
 * `_KEY_OVERRIDES` is read from the *raw* source (masking blanks string bodies)
 * and applied so `from_user` is credited as the `from` wire key.
 *
 * @param {string} masked Masked file text.
 * @param {string} raw Original file text.
 * @returns {Array<{name: string, fields: Set<string>}>} One entry per class.
 */
export function extractPython(masked, raw) {
  const maskedLines = masked.split('\n');
  const rawLines = raw.split('\n');
  const declarations = [];
  const re = /^class\s+([A-Z]\w*)[^:\n]*:/gm;
  let match;
  while ((match = re.exec(masked)) !== null) {
    const startLine = masked.slice(0, match.index).split('\n').length - 1;
    let endLine = startLine + 1;
    while (endLine < maskedLines.length) {
      const line = maskedLines[endLine];
      if (line.trim() !== '' && !/^[ \t]/.test(line)) break;
      endLine += 1;
    }
    const body = maskedLines.slice(startLine + 1, endLine);
    const rawBody = rawLines.slice(startLine + 1, endLine).join('\n');

    const overrides = {};
    const overrideMatch = /_KEY_OVERRIDES[^=]*=\s*\{([^}]*)\}/.exec(rawBody);
    if (overrideMatch) {
      for (const pair of overrideMatch[1].matchAll(/(["'])([^"']+)\1\s*:\s*(["'])([^"']+)\3/g)) {
        overrides[pair[2]] = pair[4];
      }
    }

    const fields = new Set();
    let depth = 0;
    for (const line of body) {
      if (depth === 0) {
        const key = /^ {4}([a-z_]\w*)\s*:(?![=:])/.exec(line);
        if (key && !key[1].startsWith('_') && !/ClassVar/.test(line)) {
          fields.add(overrides[key[1]] || key[1]);
        }
      }
      depth = Math.max(0, depth + bracketDelta(line));
    }
    declarations.push({ name: match[1], fields });
    // Resume scanning at the first line after the class body.
    let cursor = 0;
    for (let n = 0; n < endLine && n < maskedLines.length; n += 1) cursor += maskedLines[n].length + 1;
    re.lastIndex = Math.max(re.lastIndex, cursor);
  }
  return declarations;
}

/**
 * Where each package keeps its type declarations, and which extractor reads them.
 */
const PACKAGES = {
  node: {
    label: 'TypeScript interfaces',
    dir: 'packages/node/src',
    extension: '.ts',
    mask: {},
    // node models the documented `Update` object as `interface RawUpdate`
    // because `Update` is taken by the rich wrapper class in kernel/update.ts
    // (`export class Update implements RawUpdate`). It is the only docs type
    // node declares under a different identifier.
    rename: { RawUpdate: 'Update' },
    extract: (masked) => extractTypeScript(masked),
  },
  go: {
    label: 'Go structs',
    dir: 'packages/go/pkg',
    extension: '.go',
    // Backticks open a raw string in Go and that raw string holds the json
    // tag, so template literals must not be treated as TS templates and the
    // tag body must not be blanked out.
    mask: { templateLiterals: false, keepStrings: true },
    skipFile: (name) => name.endsWith('_test.go'),
    extract: (masked) => extractGo(masked),
  },
  python: {
    label: 'Python dataclasses',
    dir: 'packages/python/src/telebot_py/types',
    extension: '.py',
    mask: { hashComments: true },
    skipFile: (name) => name === '__init__.py',
    extract: (masked, raw) => extractPython(masked, raw),
  },
};

/**
 * Recursively lists files with a given extension.
 *
 * @param {string} dir Directory to walk.
 * @param {string} extension Extension to keep, e.g. `.ts`.
 * @returns {Promise<string[]>} Absolute paths, sorted for deterministic output.
 */
async function walk(dir, extension) {
  const found = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      found.push(...(await walk(full, extension)));
    } else if (path.extname(entry.name).toLowerCase() === extension) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Collects a package's declared types as candidate field sets per name.
 *
 * A name can legitimately have several declarations (Go declares two unrelated
 * `WebAppData` structs), so they are kept as separate candidates ordered
 * largest-first rather than unioned: unioning would credit a type with keys that
 * belong to a different struct and could mask a real gap. `auditPackage` picks
 * the best candidate and surfaces the ambiguity.
 *
 * @param {string} key Package key.
 * @param {string} root Repository root.
 * @returns {Promise<Map<string, Array<Set<string>>>>} Type name to candidate wire-key sets.
 */
export async function collectDeclaredTypes(key, root = REPO_ROOT) {
  const pkg = PACKAGES[key];
  if (!pkg) throw new Error(`Unknown package "${key}" (expected node|go|python)`);
  const declared = new Map();
  const push = (name, fields) => {
    const candidates = declared.get(name);
    if (candidates) candidates.push(fields);
    else declared.set(name, [fields]);
  };

  for (const file of await walk(path.join(root, pkg.dir), pkg.extension)) {
    if (pkg.skipFile && pkg.skipFile(path.basename(file))) continue;
    const raw = await readFile(file, 'utf-8');
    const masked = maskCommentsAndStrings(raw, pkg.mask);
    for (const entry of pkg.extract(masked, raw)) push(entry.name, entry.fields);
  }

  // node models the documented `Update` under the identifier `RawUpdate`; move
  // those candidates onto the documented name.
  for (const [alias, docsName] of Object.entries(pkg.rename ?? {})) {
    const candidates = declared.get(alias);
    if (!candidates) continue;
    for (const fields of candidates) push(docsName, fields);
    declared.delete(alias);
  }

  for (const candidates of declared.values()) {
    candidates.sort((a, b) => b.size - a.size);
  }
  return declared;
}

/**
 * Compares one package against the oracle.
 *
 * @param {string} key Package key (`node` | `go` | `python`).
 * @param {object} oracle Parsed documentation oracle.
 * @param {string} [root] Repository root.
 * @returns {Promise<object>} Audit report for that package.
 */
export async function auditPackage(key, oracle, root = REPO_ROOT) {
  const pkg = PACKAGES[key];
  if (!pkg) throw new Error(`Unknown package "${key}" (expected node|go|python)`);

  const declared = await collectDeclaredTypes(key, root);

  // "Concrete" = the docs table lists at least one field. The 35 field-less
  // headings (MessageOrigin, InputMedia, CallbackGame, ...) are abstract
  // unions, so their absence is not a modelling gap.
  const concrete = new Map(
    Object.entries(oracle.types)
      .filter(([, type]) => Object.keys(type.fields).length > 0)
      .map(([name, type]) => [name, type]),
  );

  const unmodelled = [...concrete.keys()].filter((name) => !declared.has(name)).sort();

  const rows = [];
  const ambiguous = [];
  for (const [name, candidates] of declared) {
    const docsType = concrete.get(name);
    if (!docsType) continue;
    if (candidates.length > 1) ambiguous.push(name);

    // A package models a type faithfully if ANY of its same-named declarations
    // does, so judge by the best candidate rather than by an average.
    let best = null;
    for (const wireKeys of candidates) {
      const required = [];
      const optional = [];
      for (const [field, meta] of Object.entries(docsType.fields)) {
        if (wireKeys.has(field)) continue;
        if (meta.optional) optional.push(field);
        else required.push(field);
      }
      const score = required.length * 1000 + optional.length;
      if (best === null || score < best.score) best = { required, optional, score };
    }

    if (best.required.length > 0 || best.optional.length > 0) {
      rows.push({
        name,
        required: best.required,
        optional: best.optional,
        total: Object.keys(docsType.fields).length,
        declarations: candidates.length,
      });
    }
  }
  rows.sort(
    (a, b) =>
      b.required.length - a.required.length ||
      a.optional.length - b.optional.length ||
      a.name.localeCompare(b.name),
  );

  return {
    key,
    label: pkg.label,
    declared: declared.size,
    modelled: [...declared.keys()].filter((name) => concrete.has(name)).length,
    unmodelled,
    rows,
    ambiguous: ambiguous.sort(),
    typesWithMissing: rows.length,
    missingRequired: rows.reduce((sum, row) => sum + row.required.length, 0),
    missingOptional: rows.reduce((sum, row) => sum + row.optional.length, 0),
  };
}

/**
 * Renders a fixed-width summary table.
 *
 * @param {object[]} reports Per-package audit results.
 * @returns {string} Table text.
 */
export function renderTable(reports) {
  const header = [
    'package',
    'declared',
    'modelled docs types',
    'types w/ missing fields',
    'missing REQUIRED',
    'missing optional',
    'unmodelled docs types',
  ];
  const widths = header.map((text) => text.length);
  const body = reports.map((report) => [
    report.key,
    String(report.declared),
    String(report.modelled),
    String(report.typesWithMissing),
    String(report.missingRequired),
    String(report.missingOptional),
    String(report.unmodelled.length),
  ]);
  for (const row of body) {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index], cell.length);
    });
  }
  const line = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd();
  return [line(header), line(widths.map((w) => '-'.repeat(w))), ...body.map(line)].join('\n');
}

/**
 * Resolves the oracle from the most specific source the CLI was given.
 *
 * @param {{offline?: string, oracle?: string, refresh?: boolean}} options Parsed flags.
 * @returns {Promise<{oracle: object, source: string}>} Oracle plus where it came from.
 * @throws {Error} When the live page cannot be fetched or a path is missing.
 */
async function resolveOracle(options) {
  if (options.offline !== undefined) {
    if (!fs.existsSync(options.offline)) throw new Error(`No such file: ${options.offline}`);
    return { oracle: parseDocs(await readFile(options.offline, 'utf-8')), source: options.offline };
  }
  if (options.oracle !== undefined) {
    if (!fs.existsSync(options.oracle)) {
      throw new Error(`No such oracle: ${options.oracle} (build it: node scripts/bot-api-docs.mjs)`);
    }
    return { oracle: JSON.parse(await readFile(options.oracle, 'utf-8')), source: options.oracle };
  }
  const target = oraclePath();
  if (options.refresh || !fs.existsSync(target)) {
    const response = await fetch(DOCS_URL, { headers: { 'User-Agent': 'telebot-bot-api-oracle/1.0' } });
    if (!response.ok) throw new Error(`Failed to fetch ${DOCS_URL}: HTTP ${response.status}`);
    const fresh = parseDocs(await response.text(), DOCS_URL);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(fresh, null, 2)}\n`, 'utf-8');
    return { oracle: fresh, source: `${DOCS_URL} (fetched, cached to ${target})` };
  }
  return { oracle: JSON.parse(await readFile(target, 'utf-8')), source: target };
}

/**
 * CLI entry point.
 *
 * @param {string[]} argv Arguments after the script name.
 * @returns {Promise<number>} Process exit code: 0 pass, 1 gate failure, 2 usage error.
 */
export async function main(argv = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--report') options.report = true;
    else if (flag === '--refresh') options.refresh = true;
    else if (flag === '--package') [options.package, i] = [argv[i + 1], i + 1];
    else if (flag === '--oracle') [options.oracle, i] = [path.resolve(argv[i + 1]), i + 1];
    else if (flag === '--offline') [options.offline, i] = [path.resolve(argv[i + 1]), i + 1];
    else if (flag === '--help' || flag === '-h') options.help = true;
    else {
      console.error(`Unknown argument: ${flag}`);
      options.help = true;
      options.bad = true;
    }
  }

  if (options.help) {
    console.log(
      [
        'Usage: node scripts/bot-api-fidelity.mjs [--report] [--package node|go|python]',
        '                          [--oracle <path> | --offline <page.html>] [--refresh]',
        '',
        'Reports, per package, which documented Bot API types are not modelled at',
        'all and which documented fields are missing from the types that are.',
        '',
        'Exits non-zero when a package is missing a REQUIRED documented field on a',
        'type it declares. --report prints the same tables but never fails.',
        `Oracle defaults to ${oraclePath()}; build it with node scripts/bot-api-docs.mjs.`,
      ].join('\n'),
    );
    return options.bad ? 2 : 0;
  }

  let resolved;
  try {
    resolved = await resolveOracle(options);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const { oracle, source } = resolved;

  const keys = options.package === undefined ? Object.keys(PACKAGES) : [options.package];
  for (const key of keys) {
    if (!PACKAGES[key]) {
      console.error(`Unknown package "${key}" (expected node|go|python)`);
      return 2;
    }
  }

  console.log(`Docs oracle: Bot API ${oracle.version}  [${source}]`);
  console.log(`Parser counts: ${formatCounts(oracle.counts)}`);
  console.log('');

  const reports = [];
  for (const key of keys) reports.push(await auditPackage(key, oracle));

  console.log(renderTable(reports));

  for (const report of reports) {
    console.log('');
    console.log(`--- ${report.key}: ${report.label} ---`);
    if (report.rows.length === 0) {
      console.log('  modelled types carry every documented field');
    }
    for (const row of report.rows) {
      const marks = [...row.required.map((field) => `${field}*`), ...row.optional];
      console.log(`  ${row.name.padEnd(32)} ${row.required.length ? 'REQUIRED' : 'optional'}  ${marks.join(', ')}`);
    }
    if (report.ambiguous.length > 0) {
      console.log(`  judged from several same-named declarations: ${report.ambiguous.join(', ')}`);
    }
    if (report.unmodelled.length > 0) {
      console.log(`  concrete docs types not modelled at all (${report.unmodelled.length}):`);
      console.log(`    ${report.unmodelled.join(', ')}`);
    }
  }

  const failing = reports.filter((report) => report.missingRequired > 0);
  console.log('');
  if (options.report) {
    console.log(
      failing.length === 0
        ? '--report: no missing REQUIRED docs fields.'
        : `--report: NOT failing. ${failing.map((r) => `${r.key}=${r.missingRequired}`).join(' ')} missing REQUIRED docs fields.`,
    );
    return 0;
  }
  if (failing.length > 0) {
    console.error(
      `FAIL: missing REQUIRED docs fields -> ${failing.map((r) => `${r.key}=${r.missingRequired}`).join(' ')}`,
    );
    return 1;
  }
  console.log('PASS: no missing REQUIRED docs fields on any modelled type.');
  return 0;
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().then((code) => process.exit(code));
}
