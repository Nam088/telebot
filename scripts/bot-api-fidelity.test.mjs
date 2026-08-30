/**
 * Tests for the per-package field mappers and for the missing-REQUIRED gate.
 *
 * Run with: node --test scripts/bot-api-fidelity.test.mjs
 * (or via the repository's `npm run test:scripts` script)
 *
 * @module
 */

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  auditPackage,
  compareBaseline,
  extractGo,
  extractPython,
  extractTypeScript,
  heritageNames,
  main,
  maskCommentsAndStrings,
  renderMarkdown,
  renderTable,
} from './bot-api-fidelity.mjs';

/** A two-field docs type: `a` is required on the wire, `b` is optional. */
const ORACLE = {
  version: '9.9',
  counts: { anchors: 1, methods: 0, types: 1, types_with_fields: 1, fields: 2 },
  anchors: ['thing'],
  methods: {},
  types: {
    Thing: {
      anchor: 'thing',
      desc: 'A thing.',
      fields: {
        a: { type: 'Integer', optional: false, desc: 'Required identifier' },
        b: { type: 'String', optional: true, desc: 'Optional. Note' },
      },
    },
  },
};

test('masks doc comments so commented-out markup cannot be read as fields', () => {
  const masked = maskCommentsAndStrings('export interface X {\n  /** a: fake */\n  real: number;\n}\n');
  assert.equal(masked.includes('fake'), false);
  assert.ok(masked.includes('real: number'));
  // Line structure survives, so line numbers still line up with the raw file.
  assert.equal(masked.split('\n').length, 5);
});

test('extracts TypeScript interface keys but not nested or index-signature keys', () => {
  const source = [
    'export interface Thing {',
    '  /** a: documented, not a field */',
    '  a: number;',
    '  readonly b?: string;',
    '  nested?: {',
    '    c: number;',
    '  };',
    '  [key: string]: unknown;',
    '  method(d: number): void;',
    '}',
    'interface NotExported { a: number }',
  ].join('\n');
  const [only] = extractTypeScript(maskCommentsAndStrings(source));
  assert.equal(only.name, 'Thing');
  assert.deepEqual([...only.fields].sort(), ['a', 'b', 'nested']);
  assert.equal(only.fields.has('c'), false, 'nested object keys must not be credited');
  assert.equal(only.fields.has('method'), false, 'methods are not wire fields');
  assert.equal(only.fields.has('[key: string]'), false, 'index signatures are not wire fields');
});

test('reads Go wire keys from json tags, honouring omitempty and skipping ignored tags', () => {
  const source = [
    'package types',
    '',
    '// Thing represents a thing.',
    'type Thing struct {',
    '\tA int64  `json:"a"`',
    '\tB string `json:"b,omitempty"`',
    '\tC string `json:"-"`',
    '\t// D is a comment, not a field',
    '\tE int64',
    '\t// D comments only',
    '}',
  ].join('\n');
  const [only] = extractGo(maskCommentsAndStrings(source, { templateLiterals: false, keepStrings: true }));
  assert.equal(only.name, 'Thing');
  assert.deepEqual([...only.fields].sort(), ['a', 'b', 'e']);
});

test('Go struct tags survive masking (the tag body is the data)', () => {
  const source = 'type T struct {\n\tA int64 `json:"a_tag_value"`\n}\n';
  const masked = maskCommentsAndStrings(source, { templateLiterals: false, keepStrings: true });
  assert.ok(masked.includes('json:"a_tag_value"'), 'tag text must not be blanked');
});

test('extracts Python dataclass fields, applies _KEY_OVERRIDES, and ignores docstrings', () => {
  const source = [
    '@dataclasses.dataclass(frozen=True, slots=True)',
    'class Thing(TelegramObject):',
    '    """A thing.',
    '',
    '    Attributes:',
    '        a: Docstring entry that must NOT count as a field.',
    '        zzz: Another docstring entry.',
    '    """',
    '',
    '    a: int',
    '    from_user: User | None = None',
    '    b: (',
    '        str',
    '        | int',
    '    ) = None',
    '    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}',
    '    _HIDDEN: t.ClassVar[int] = 3',
    '',
    '    def helper(self) -> int:',
    '        return 0',
  ].join('\n');
  const masked = maskCommentsAndStrings(source, { hashComments: true });
  const [only] = extractPython(masked, source);
  assert.equal(only.name, 'Thing');
  // `from_user` is credited as the wire key `from`; docstring entries, the
  // private ClassVar and the method are all excluded.
  assert.deepEqual([...only.fields].sort(), ['a', 'b', 'from']);
});

test('auditPackage reports a missing optional field without failing the gate', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/go/pkg/types/thing.go'),
      'package types\n\ntype Thing struct {\n\tA int64 `json:"a"`\n}\n',
      'utf-8',
    );
    const report = await auditPackage('go', ORACLE, root);
    assert.equal(report.missingRequired, 0);
    assert.equal(report.missingOptional, 1);
    assert.equal(report.typesWithMissing, 1);
    assert.deepEqual(report.rows[0].optional, ['b']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('auditPackage flags a missing REQUIRED field, which is what fails the build', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/go/pkg/types/thing.go'),
      'package types\n\ntype Thing struct {\n\tB string `json:"b,omitempty"`\n}\n',
      'utf-8',
    );
    const report = await auditPackage('go', ORACLE, root);
    assert.deepEqual(report.rows[0].required, ['a']);
    assert.equal(report.missingRequired, 1);
    assert.equal(report.modelled, 1);
    // The docs type is declared, so it must not also be counted as unmodelled.
    assert.deepEqual(report.unmodelled, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a docs type with no declaration at all is reported as unmodelled', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    await writeFile(path.join(root, 'packages/go/pkg/types/other.go'), 'package types\n', 'utf-8');
    const report = await auditPackage('go', ORACLE, root);
    assert.deepEqual(report.unmodelled, ['Thing']);
    assert.equal(report.typesWithMissing, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a type whose docs table is empty is abstract and never counted as a gap', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    await writeFile(path.join(root, 'packages/go/pkg/types/other.go'), 'package types\n', 'utf-8');
    const abstract = structuredClone(ORACLE);
    abstract.types.Abstract = { anchor: 'abstract', desc: 'Base type.', fields: {} };
    const report = await auditPackage('go', abstract, root);
    assert.equal(report.unmodelled.includes('Abstract'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('judges an ambiguous name by its best same-named declaration', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    // Two unrelated structs share the name; one of them is the wire type.
    await writeFile(
      path.join(root, 'packages/go/pkg/types/thing.go'),
      'package types\n\ntype Thing struct {\n\tA int64 `json:"a"`\n}\n\ntype Thing2 struct {\n\tZ int64 `json:"z"`\n}\n',
      'utf-8',
    );
    await writeFile(
      path.join(root, 'packages/go/pkg/types/other.go'),
      'package bot\n\ntype Thing struct {\n\tOther string `json:"other"`\n}\n',
      'utf-8',
    );
    const report = await auditPackage('go', ORACLE, root);
    // The `a`-carrying declaration wins, so only the optional `b` is missing.
    assert.equal(report.missingRequired, 0);
    assert.deepEqual(report.rows[0].optional, ['b']);
    assert.equal(report.rows[0].declarations, 2);
    assert.deepEqual(report.ambiguous, ['Thing']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('renderTable prints one aligned row per package', () => {
  const table = renderTable([
    {
      key: 'go',
      label: 'Go structs',
      declared: 452,
      modelled: 301,
      unmodelled: ['a'],
      rows: [],
      ambiguous: [],
      typesWithMissing: 18,
      missingRequired: 3,
      missingOptional: 40,
    },
  ]);
  assert.match(table.split('\n')[0], /^package\s+declared\s+modelled docs types/);
  assert.ok(table.includes('go'));
  assert.ok(table.includes('452'));
  assert.ok(table.includes('18'));
});

test('heritageNames reads extends clauses the way TypeScript writes them', () => {
  assert.deepEqual(heritageNames(''), []);
  assert.deepEqual(heritageNames(' extends Base'), ['Base']);
  assert.deepEqual(heritageNames(' extends A, B'), ['A', 'B']);
  assert.deepEqual(heritageNames(' extends Record<string, never>'), ['Record']);
  assert.deepEqual(heritageNames(' extends ns.Base'), ['ns.Base']);
});

test('extractTypeScript records parents without crediting inherited keys at parse time', () => {
  const source = [
    'export interface Base {',
    '  a: number;',
    '}',
    'export interface Thing extends Base {',
    '  b?: string;',
    '}',
  ].join('\n');
  const parsed = extractTypeScript(maskCommentsAndStrings(source));
  const byName = Object.fromEntries(parsed.map((entry) => [entry.name, entry]));
  assert.deepEqual(byName.Base.parents, []);
  assert.deepEqual(byName.Thing.parents, ['Base']);
  assert.deepEqual([...byName.Thing.fields], ['b'], 'the body alone is counted here');
});

test('a child interface is audited with the fields it inherits', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/node/src'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/node/src/base.ts'),
      'export interface Base {\n  a: number;\n}\n',
      'utf-8',
    );
    await writeFile(
      path.join(root, 'packages/node/src/thing.ts'),
      'import { Base } from "./base.js";\n\nexport interface Thing extends Base {\n  b?: string;\n}\n',
      'utf-8',
    );
    const report = await auditPackage('node', ORACLE, root);
    assert.equal(report.modelled, 1);
    assert.deepEqual(report.unmodelled, []);
    assert.equal(report.missingRequired, 0, 'inherited `a` must count as declared');
    assert.equal(report.missingOptional, 0, 'inherited `b` must count as declared');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('heritage never credits a key the package does not actually declare', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/node/src'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/node/src/thing.ts'),
      'export interface Thing extends SomethingElse {\n  b?: string;\n}\n',
      'utf-8',
    );
    const report = await auditPackage('node', ORACLE, root);
    assert.equal(report.missingRequired, 1, '`a` is neither declared nor inherited');
    assert.deepEqual(report.rows[0].required, ['a']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a row names the file holding the declaration that was judged', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    await mkdir(path.join(root, 'packages/go/pkg/types'), { recursive: true });
    // Same-named structs in two files: the declaration that also carries `b`
    // is the one judged, so its path is the one a reviewer has to fix.
    await writeFile(
      path.join(root, 'packages/go/pkg/types/other.go'),
      'package types\n\ntype Thing struct {\n\tOther string `json:"other"`\n}\n',
      'utf-8',
    );
    await writeFile(
      path.join(root, 'packages/go/pkg/types/thing.go'),
      'package types\n\ntype Thing struct {\n\tB string `json:"b,omitempty"`\n}\n',
      'utf-8',
    );
    const report = await auditPackage('go', ORACLE, root);
    assert.equal(report.rows[0].file, 'packages/go/pkg/types/thing.go');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a child row points at the child file even though keys came from the parent', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  try {
    const oracle = structuredClone(ORACLE);
    // `c` is documented and required but declared nowhere, so Thing keeps a gap.
    oracle.types.Thing.fields.c = { type: 'String', optional: false, desc: 'Required too' };
    await mkdir(path.join(root, 'packages/node/src/client/types'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/node/src/client/types/base.ts'),
      'export interface Base {\n  a: number;\n}\n',
      'utf-8',
    );
    await writeFile(
      path.join(root, 'packages/node/src/client/types/thing.ts'),
      'export interface Thing extends Base {\n  b?: string;\n}\n',
      'utf-8',
    );
    const report = await auditPackage('node', oracle, root);
    assert.deepEqual(report.rows[0].required, ['c']);
    assert.equal(report.rows[0].file, 'packages/node/src/client/types/thing.ts');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('--json dumps the report it just printed', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  const target = path.join(dir, 'reports', 'fidelity.json');
  try {
    t.mock.method(console, 'log', () => {});
    t.mock.method(console, 'error', () => {});
    // --report keeps this independent of whether the real tree has gaps today.
    const code = await main(['--package', 'go', '--report', '--json', target]);
    assert.equal(code, 0);

    const dumped = JSON.parse(await readFile(target, 'utf-8'));
    assert.equal(dumped.oracle.version.length > 0, true);
    // This dump is meant to be committed as a CI baseline, so it must not carry
    // a machine-specific absolute path.
    assert.equal(
      dumped.oracle.source.startsWith('/'),
      false,
      `oracle source must be repo-relative, got ${dumped.oracle.source}`,
    );
    assert.equal(dumped.packages.length, 1);
    assert.equal(dumped.packages[0].key, 'go');
    // A second round-trip must be identical: nothing unserializable (a Set, say)
    // may reach the payload, or a baseline diff would read it as empty.
    assert.deepEqual(JSON.parse(JSON.stringify(dumped)), dumped);
    for (const report of dumped.packages) {
      assert.equal(typeof report.missingRequired, 'number');
      assert.ok(Array.isArray(report.unmodelled));
      for (const row of report.rows) {
        assert.match(row.file, /^packages\/go\/pkg\/.+\.go$/, 'paths stay repo-relative');
      }
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('--baseline gates on drift from the committed report, not on absolute gaps', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fidelity-'));
  const dump = path.join(dir, 'fidelity.json');
  try {
    t.mock.method(console, 'log', () => {});
    t.mock.method(console, 'error', () => {});
    await main(['--package', 'go', '--report', '--json', dump]);
    const fresh = JSON.parse(await readFile(dump, 'utf-8'));

    // Self-consistent: today's tree against today's report is not a regression.
    assert.equal(await main(['--package', 'go', '--baseline', dump]), 0);

    // Drop one entry from the baseline's unmodelled list and the audit appears
    // to have modelled nothing new — it found surface nobody covered. Must fail.
    const stale = structuredClone(fresh);
    stale.packages[0].unmodelled = fresh.packages[0].unmodelled.slice(1);
    await writeFile(dump, JSON.stringify(stale), 'utf-8');
    assert.equal(await main(['--package', 'go', '--baseline', dump]), 1);

    // A missing baseline is operator error, not a reason to pass.
    const code = await main(['--package', 'go', '--baseline', path.join(dir, 'nope.json')]);
    assert.equal(code, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/** Minimal audit-shaped report for the baseline diff tests. */
const reportOf = (key, rows, unmodelled) => ({ key, rows, unmodelled });

/** Minimal `--json` payload shape, which is also the committed baseline shape. */
const baselineOf = (packages, version = '9.9') => ({
  oracle: { version, source: 'scripts/bot-api-oracle.json' },
  packages,
});

test('compareBaseline passes while nothing gets worse', () => {
  const known = [{ name: 'Thing', file: 'a.go', required: ['a'], optional: ['b'] }];
  const verdict = compareBaseline(
    [reportOf('go', known, ['Unmodelled'])],
    baselineOf([reportOf('go', known, ['Unmodelled'])]),
  );
  assert.equal(verdict.regressions, 0);
  assert.equal(verdict.improvements, 0);
});

test('compareBaseline allows a known gap but not a field that only just went missing', () => {
  const baseline = baselineOf([
    reportOf(
      'go',
      [
        { name: 'Thing', file: 'a.go', required: ['a'], optional: ['b'] },
        { name: 'Other', file: 'b.go', required: ['x'], optional: [] },
      ],
      [],
    ),
  ]);
  const current = [
    // `a` and `b` were already missing; `c` is the new hole. `Other` is absent
    // from the rows now, i.e. fully modelled on this branch.
    reportOf('go', [{ name: 'Thing', file: 'a.go', required: ['a', 'c'], optional: ['b'] }], []),
  ];
  const verdict = compareBaseline(current, baseline);
  assert.equal(verdict.regressions, 1, 'only `c` counts');
  assert.deepEqual(verdict.entries[0].newGaps, [
    { name: 'Thing', file: 'a.go', required: ['c'], optional: [] },
  ]);
  assert.deepEqual(verdict.entries[0].closed, ['Other'], 'a shrinking gap list is progress');
  assert.equal(verdict.improvements, 1);
});

test('compareBaseline flags a type that fell out of the model entirely', () => {
  // `User` was modelled in the baseline (so absent from its unmodelled list)
  // and is gone from the tree now: still a docs type, now unmodelled.
  const verdict = compareBaseline(
    [reportOf('go', [], ['Chat', 'User'])],
    baselineOf([reportOf('go', [], ['Chat'])]),
  );
  assert.deepEqual(verdict.entries[0].newlyUnmodelled, ['User']);
  assert.deepEqual(verdict.entries[0].nowModelled, [], 'Chat stays unmodelled, unchanged');
  assert.equal(verdict.regressions, 1);

  const improved = compareBaseline(
    [reportOf('go', [], ['Chat'])],
    baselineOf([reportOf('go', [], ['Chat', 'User'])]),
  );
  assert.deepEqual(improved.entries[0].nowModelled, ['User']);
  assert.equal(improved.regressions, 0);
  assert.equal(improved.improvements, 1);
});

test('compareBaseline refuses to let a package slip out of the baseline', () => {
  const verdict = compareBaseline(
    [reportOf('node', [], []), reportOf('python', [], [])],
    baselineOf([reportOf('node', [], [])]),
  );
  assert.deepEqual(verdict.unbaselined, ['python']);
  assert.equal(verdict.regressions, 1, 'uncovered surface must fail the gate');
});

/** One full-shaped report for the markdown renderer tests. */
const mdReport = (overrides = {}) => ({
  key: 'node',
  label: 'TypeScript interfaces',
  declared: 410,
  modelled: 287,
  unmodelled: ['A', 'B'],
  rows: [
    {
      name: 'Thing',
      file: 'packages/node/src/thing.ts',
      required: ['legacy_field'],
      optional: [],
      total: 3,
      declarations: 1,
    },
  ],
  ambiguous: [],
  typesWithMissing: 1,
  missingRequired: 1,
  missingOptional: 0,
  ...overrides,
});

test('renderMarkdown tabulates each package and folds the long lists away', () => {
  const md = renderMarkdown([mdReport()], { oracleVersion: '10.3' });
  assert.match(
    md,
    /\| package \| declared \| modelled \| missing REQUIRED \| missing optional \| unmodelled \|/,
  );
  assert.match(md, /\| node \| 410 \| 287 \| 1 \| 0 \| 2 \|/);
  assert.match(md, /<details>/, 'the unmodelled list must not flood the summary');
  assert.ok(md.includes('A, B'), 'but the names are still there, collapsed');
});

test('renderMarkdown shows only drift once a baseline verdict exists', () => {
  const baseline = baselineOf([
    reportOf('node', [{ name: 'Thing', file: 'x', required: ['legacy_field'], optional: [] }], []),
  ]);
  const current = [
    mdReport({
      rows: [
        {
          name: 'Thing',
          file: 'packages/node/src/thing.ts',
          required: ['legacy_field', 'fresh_field'],
          optional: [],
          total: 4,
          declarations: 1,
        },
      ],
    }),
  ];
  const md = renderMarkdown(current, {
    verdict: compareBaseline(current, baseline),
    oracleVersion: '10.3',
  });
  assert.match(md, /Thing/);
  assert.match(md, /fresh_field/, 'the field that only just went missing is named');
  assert.match(md, /packages\/node\/src\/thing\.ts/, 'with the file to fix');
  assert.doesNotMatch(md, /legacy_field/, 'what the baseline already tolerated is not re-listed');
});

test('renderMarkdown states a drift-free tree in one line', () => {
  const current = [mdReport()];
  const baseline = baselineOf([
    reportOf(
      'node',
      [{ name: 'Thing', file: 'x', required: ['legacy_field'], optional: [] }],
      ['A', 'B'],
    ),
  ]);
  const md = renderMarkdown(current, {
    verdict: compareBaseline(current, baseline),
    oracleVersion: '10.3',
  });
  assert.match(md, /no drift versus the baseline/i);
});
