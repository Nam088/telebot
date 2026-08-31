#!/usr/bin/env node
/**
 * Builds the Bot API documentation oracle: fetches the official
 * `https://core.telegram.org/bots/api` page, parses every method and type
 * declaration out of its HTML, and writes a JSON oracle that the rest of the
 * tooling (notably `scripts/bot-api-fidelity.mjs`) treats as the single source
 * of truth for "what does Telegram actually document".
 *
 * The oracle exists because field-level coverage of the 400 documented types
 * was previously checked only by throwaway scripts in /tmp plus a hand-built
 * JSON file, which is how three packages shipped a `Message` that decoded 42
 * of the documented 120 fields without anything in the repo noticing.
 *
 * Parsing rules this file implements (all learned from real page structure):
 *
 * - A declaration heading is `<h4><a class="anchor" name="getMe"
 *   href="#getMe"><i class="anchor-icon"></i></a>getMe</h4>`: the anchor name
 *   is the slug, the text after `</a>` is the declaration name.
 * - A declaration's own content runs from its heading to the **next heading of
 *   any level** (h2-h6). Truncating at anything but the next heading leaks a
 *   neighbouring section's table into the type — that bug invented `chat_id`
 *   and `reply_markup` on `PassportElementErrorUnspecified`.
 * - Type field tables are 3 columns (Field | Type | Description) and a field
 *   is optional exactly when its description begins with `Optional`.
 * - Method parameter tables carry a `Required` column on the current page; the
 *   older 3-column form marked optionality with `[square brackets]` around the
 *   parameter name. Both are accepted.
 *
 * Usage:
 *   node scripts/bot-api-docs.mjs                  # fetch live page
 *   node scripts/bot-api-docs.mjs --html page.html # parse offline copy
 *   node scripts/bot-api-docs.mjs --out path.json  # choose the cache path
 *
 * Zero dependencies: Node 22+ built-ins only, per the repo NFR-1 policy.
 *
 * @module
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/** Official Bot API documentation page. */
export const DOCS_URL = 'https://core.telegram.org/bots/api';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of the repository root (the directory holding `scripts/`). */
export const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

/**
 * Default oracle location. It lives under `node_modules/.cache` on purpose:
 * the parsed oracle is ~700 KB of derived data that must never be committed,
 * and `node_modules/` is already ignored. `BOT_API_ORACLE` overrides it.
 */
export const DEFAULT_ORACLE_PATH = path.join(
  REPO_ROOT,
  'node_modules',
  '.cache',
  'telebot',
  'bot-api-oracle.json',
);

/**
 * Resolves where the oracle should be read from / written to.
 *
 * @returns {string} Absolute path to the oracle JSON file.
 */
export function oraclePath() {
  return process.env.BOT_API_ORACLE ? path.resolve(process.env.BOT_API_ORACLE) : DEFAULT_ORACLE_PATH;
}

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Turns an HTML fragment into the literal text Telegram documents, reading
 * type strings such as `Array of Array of KeyboardButton` verbatim.
 *
 * Tags are removed *before* entities are decoded so that `&lt;` inside a
 * description cannot re-open markup, and `&amp;` is expanded last so that
 * `&amp;#39;` does not silently become an apostrophe.
 *
 * @param {string} html Markup fragment from a heading or table cell.
 * @returns {string} Whitespace-normalized plain text.
 */
function toText(html) {
  const stripped = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-zA-Z0-9#]+);/g, (whole, name) =>
      Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : whole,
    )
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
  return stripped.trim();
}

/**
 * Matches every heading in the document. Anchors are extracted separately from
 * the heading body because the anchor's own markup nests an `<i>` element.
 */
const HEADING_RE = /<h([2-6])(\b[^>]*)?>([\s\S]*?)<\/h\1>/g;
const ANCHOR_PREFIX_RE = /^\s*<a\b[^>]*?\bname="([^"]+)"[^>]*>[\s\S]*?<\/a>([\s\S]*)$/;

/**
 * Classifies a heading's plain text as a method, a type, or prose.
 *
 * Only `<h4>` headings are declarations (see the anchor pattern on
 * `getMe`). Within those, methods are single-word lowerCamelCase
 * (`sendMessage`) and types are single-word PascalCase (`ChatFullInfo`).
 * Everything else — `Recent changes`, `Sending files`, `August 24, 2026`,
 * `Inline mode objects`, and the `<h3>` prose sections `Stickers`, `Payments`,
 * `Games` — is never a declaration, which is what keeps 12 prose headings, 4
 * changelog dates and 3 `<h3>` section titles out of the 400-type baseline.
 *
 * @param {string} name Heading text with tags removed.
 * @param {number} [level] Heading tag level (2-6); only 4 declares API symbols.
 * @returns {'method' | 'type' | 'prose'} Declaration kind.
 */
export function classifyHeading(name, level = 4) {
  if (level !== 4) return 'prose';
  if (/^[a-z][A-Za-z0-9]*$/.test(name)) return 'method';
  if (/^[A-Z][A-Za-z0-9]*$/.test(name)) return 'type';
  return 'prose';
}

/**
 * Splits the document into ordered `{level, anchor, name, kind, html}` records
 * where `html` is exactly the content between this heading and the next one of
 * any level. This is the truncation rule the neighbouring-table leak depends on.
 *
 * @param {string} html Full page markup.
 * @returns {Array<{level: number, anchor: string, name: string, kind: string, html: string}>}
 */
export function splitSections(html) {
  const headings = [];
  HEADING_RE.lastIndex = 0;
  let match;
  while ((match = HEADING_RE.exec(html)) !== null) {
    const body = match[3];
    const anchorMatch = ANCHOR_PREFIX_RE.exec(body);
    headings.push({
      start: match.index,
      contentStart: match.index + match[0].length,
      level: Number(match[1]),
      anchor: anchorMatch ? anchorMatch[1] : '',
      name: toText(anchorMatch ? anchorMatch[2] : body),
    });
  }

  const sections = [];
  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    const next = headings[i + 1];
    const end = next ? next.start : html.length;
    sections.push({
      level: heading.level,
      anchor: heading.anchor,
      name: heading.name,
      kind: heading.anchor ? classifyHeading(heading.name, heading.level) : 'prose',
      html: html.slice(heading.contentStart, end),
    });
  }
  return sections;
}

/**
 * Extracts the first table that follows a heading.
 *
 * @param {string} sectionHtml Content between two consecutive headings.
 * @returns {{header: string[], rows: string[][]} | null} Table cells as text.
 */
function firstTable(sectionHtml) {
  const match = /<table\b[^>]*>([\s\S]*?)<\/table>/i.exec(sectionHtml);
  if (!match) return null;

  const body = match[1];
  const rowHtml = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => row[1]);
  if (rowHtml.length === 0) return null;

  const cells = (row, tag) =>
    [...row.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))].map((cell) =>
      toText(cell[1]),
    );

  const [rawHeader, ...rawRows] = rowHtml;
  const header = cells(rawHeader, 'th');
  return {
    header: header.length > 0 ? header : cells(rawHeader, 'td'),
    rows: rawRows.map((row) => cells(row, 'td')).filter((row) => row.length > 0),
  };
}

/**
 * Reads a type's 3-column field table.
 *
 * @param {ReturnType<typeof firstTable>} table Parsed table.
 * @returns {Record<string, {type: string, optional: boolean, desc: string}>}
 */
function parseFields(table) {
  const fields = {};
  for (const row of table.rows) {
    if (row.length < 3) continue;
    const [name, type, desc] = row;
    if (name === '') continue;
    fields[name] = { type, optional: desc.startsWith('Optional'), desc };
  }
  return fields;
}

/**
 * Reads a method's parameter table, accepting both the current
 * `Parameter | Type | Required | Description` layout and the older 3-column
 * layout that wrapped optional names in square brackets.
 *
 * @param {ReturnType<typeof firstTable>} table Parsed table.
 * @returns {Record<string, {type: string, optional: boolean, desc: string}>}
 */
function parseParams(table) {
  const params = {};
  const requiredColumn = table.header.findIndex((cell) => /^required$/i.test(cell));
  for (const row of table.rows) {
    if (row.length < 3) continue;
    let rawName;
    let type;
    let desc;
    let optional;
    if (requiredColumn >= 0 && row.length > requiredColumn) {
      [rawName, type, , desc] = row;
      optional = row[requiredColumn].trim() !== 'Yes';
    } else {
      [rawName, type, desc] = row;
      const bracketed = /^\[(.*)\]$/s.exec(rawName);
      if (bracketed) {
        rawName = bracketed[1];
        optional = true;
      } else {
        optional = desc.startsWith('Optional');
      }
    }
    const name = rawName.trim();
    if (name === '') continue;
    params[name] = { type, optional, desc };
  }
  return params;
}

/**
 * Parses the full Bot API documentation page into the oracle structure.
 *
 * @param {string} html Raw `https://core.telegram.org/bots/api` markup.
 * @param {string} [source] Origin recorded in the oracle for reproducibility.
 * @returns {{version: string, source: string, counts: object, anchors: string[],
 *   methods: Record<string, {anchor: string, params: object}>,
 *   types: Record<string, {anchor: string, desc: string, fields: object}>}} Oracle.
 */
export function parseDocs(html, source = DOCS_URL) {
  const versionMatch = /Bot API ([0-9]+(?:\.[0-9]+)*)/.exec(html);
  const sections = splitSections(html);

  const methods = {};
  const types = {};
  const anchors = [];

  for (const section of sections) {
    if (section.anchor !== '') anchors.push(section.anchor);
    if (section.kind !== 'method' && section.kind !== 'type') continue;

    const table = firstTable(section.html);
    const firstParagraph = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(section.html);

    if (section.kind === 'method') {
      methods[section.name] = {
        anchor: section.anchor,
        params: table ? parseParams(table) : {},
      };
    } else {
      types[section.name] = {
        anchor: section.anchor,
        desc: firstParagraph ? toText(firstParagraph[1]) : '',
        fields: table && table.header[0] === 'Field' ? parseFields(table) : {},
      };
    }
  }

  const typesWithFields = Object.values(types).filter((type) => Object.keys(type.fields).length > 0);

  return {
    version: versionMatch ? versionMatch[1] : 'unknown',
    source,
    counts: {
      anchors: anchors.length,
      methods: Object.keys(methods).length,
      types: Object.keys(types).length,
      types_with_fields: typesWithFields.length,
      fields: typesWithFields.reduce((sum, type) => sum + Object.keys(type.fields).length, 0),
    },
    anchors: anchors.sort(),
    methods,
    types,
  };
}

/**
 * Fetches the live documentation page.
 *
 * @param {string} url Page URL.
 * @returns {Promise<string>} Response body.
 * @throws {Error} When the page cannot be retrieved.
 */
async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'telebot-bot-api-oracle/1.0' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

/**
 * Loads the cached oracle, building it from the live page when absent so that
 * `npm run audit:*` works on a fresh checkout without a manual pre-step.
 *
 * @param {{offlineHtml?: string}} [options] Force an offline HTML source.
 * @returns {Promise<{oracle: object, path: string, built: boolean}>} Oracle and provenance.
 */
export async function buildOracle(options = {}) {
  const target = oraclePath();
  const html =
    options.offlineHtml !== undefined
      ? await readFile(options.offlineHtml, 'utf-8')
      : await fetchHtml(DOCS_URL);
  const oracle = parseDocs(html, options.offlineHtml ? path.resolve(options.offlineHtml) : DOCS_URL);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(oracle, null, 2)}\n`, 'utf-8');
  return { oracle, path: target, built: true };
}

/**
 * Reads the oracle from the cache, building it first when missing or stale.
 *
 * @param {{refresh?: boolean, offlineHtml?: string}} [options] CLI options.
 * @returns {Promise<{oracle: object, path: string}>} Oracle and its path.
 */
export async function loadOracle(options = {}) {
  const target = oraclePath();
  if (!options.refresh && options.offlineHtml === undefined) {
    try {
      return { oracle: JSON.parse(await readFile(target, 'utf-8')), path: target };
    } catch {
      // Cold cache: fall through and build from the live page.
    }
  }
  const { oracle } = await buildOracle(options);
  return { oracle, path: target };
}

/**
 * Strips the prose that the fidelity audit never compares.
 *
 * `scripts/bot-api-oracle.json` is committed to the repo, so it has to stay
 * small enough for a Bot API update to produce a reviewable diff. The field
 * names, types and requiredness are what the audit reads; the `desc` prose is
 * ~60% of the full oracle's bytes and is only useful when reading the live page.
 *
 * @param {object} oracle Oracle as produced by `parseDocs`.
 * @returns {object} A copy carrying `anchor`, `type` and `optional` only.
 */
export function trimOracle(oracle) {
  const dropDesc = (entries) =>
    Object.fromEntries(
      Object.entries(entries).map(([name, value]) => {
        const { desc, ...rest } = value;
        void desc;
        return [name, rest];
      }),
    );
  return {
    ...oracle,
    methods: Object.fromEntries(
      Object.entries(oracle.methods).map(([name, method]) => [
        name,
        { ...method, params: dropDesc(method.params ?? {}) },
      ]),
    ),
    types: Object.fromEntries(
      Object.entries(oracle.types).map(([name, type]) => [
        name,
        { anchor: type.anchor, fields: dropDesc(type.fields ?? {}) },
      ]),
    ),
  };
}

/**
 * Formats the sanity baseline so parser drift is visible in one line.
 *
 * @param {object} counts `oracle.counts`.
 * @returns {string} Single-line summary.
 */
export function formatCounts(counts) {
  return `anchors=${counts.anchors} methods=${counts.methods} types=${counts.types} types_with_fields=${counts.types_with_fields} fields=${counts.fields}`;
}

/**
 * CLI entry point.
 *
 * @param {string[]} argv Arguments after the script name.
 * @returns {Promise<number>} Process exit code.
 */
export async function main(argv = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--html' || flag === '--out' || flag === '--url') {
      options[flag.slice(2)] = argv[i + 1];
      i += 1;
    } else if (flag === '--trim') {
      options.trim = true;
    } else if (flag === '--help' || flag === '-h') {
      options.help = true;
    } else {
      console.error(`Unknown argument: ${flag}`);
      options.help = true;
      options.bad = true;
    }
  }

  if (options.help) {
    console.log(
      [
        'Usage: node scripts/bot-api-docs.mjs [--html <path>] [--out <path>] [--url <url>] [--trim]',
        '',
        'Fetches the official Bot API page, parses every method/type declaration',
        'and writes the JSON oracle used by scripts/bot-api-fidelity.mjs.',
        'Without --html the live page is fetched over the network.',
        '--trim drops the doc prose so the result can be committed:',
        '  node scripts/bot-api-docs.mjs --out scripts/bot-api-oracle.json --trim',
        `Default output: ${DEFAULT_ORACLE_PATH}`,
      ].join('\n'),
    );
    return options.bad ? 2 : 0;
  }

  const source = options.html;
  if (source !== undefined && !fs.existsSync(source)) {
    console.error(`No such file: ${source}`);
    return 1;
  }

  const html = source !== undefined ? await readFile(source, 'utf-8') : await fetchHtml(options.url ?? DOCS_URL);
  let oracle = parseDocs(html, source !== undefined ? path.resolve(source) : (options.url ?? DOCS_URL));
  if (options.trim) oracle = trimOracle(oracle);

  const target = options.out ? path.resolve(options.out) : oraclePath();
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(oracle, null, 2)}\n`, 'utf-8');

  console.log(`Bot API ${oracle.version} oracle written to ${target}`);
  console.log(formatCounts(oracle.counts));
  return 0;
}

const selfPath = path.resolve(fileURLToPath(import.meta.url));
const invokedDirectly = process.argv[1] !== undefined && path.resolve(process.argv[1]) === selfPath;

if (invokedDirectly) {
  main().then((code) => process.exit(code));
}
