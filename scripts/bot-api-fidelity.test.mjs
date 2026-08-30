/**
 * Tests for the per-package field mappers and for the missing-REQUIRED gate.
 *
 * Run with: node --test scripts/bot-api-fidelity.test.mjs
 * (or via the repository's `npm run test:docs` script)
 *
 * @module
 */

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  auditPackage,
  extractGo,
  extractPython,
  extractTypeScript,
  maskCommentsAndStrings,
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
