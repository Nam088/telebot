/**
 * Offline self-tests for the Bot API documentation parser.
 *
 * Run with: node --test scripts/
 *
 * The fixture in `__fixtures__/bot-api-sample.html` is a trimmed fragment that
 * reproduces the exact markup shapes of the live page, including the two bugs
 * an earlier pass shipped: a neighbouring prose section's table leaking into a
 * type, and prose headings being counted as types.
 *
 * @module
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { classifyHeading, parseDocs } from './bot-api-docs.mjs';

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '__fixtures__',
  'bot-api-sample.html',
);

const html = await readFile(FIXTURE, 'utf-8');
const oracle = parseDocs(html, 'fixture');

test('reads the version marker out of the page, not a hard-coded constant', () => {
  assert.equal(oracle.version, '9.9');
  assert.equal(oracle.source, 'fixture');
});

test('counts declarations using the live-page baseline rules', () => {
  // 14 heading anchors; 3 methods; 5 types of which 3 carry a field table.
  assert.deepEqual(oracle.counts, {
    anchors: 14,
    methods: 3,
    types: 5,
    types_with_fields: 3,
    fields: 7,
  });
  assert.equal(oracle.anchors.length, new Set(oracle.anchors).size);
  assert.ok(oracle.anchors.includes('sendmessage'));
});

test('a type ends at the next heading of ANY level, so prose tables cannot leak in', () => {
  const fields = Object.keys(oracle.types.TestType.fields);
  assert.deepEqual(fields, ['identifier', 'photo', 'rows', 'payload', 'always']);
  // The <h3>Stickers</h3> section below TestType owns this table now. Regression
  // guard: an earlier parser truncated only at <h4> and invented these fields
  // on PassportElementErrorUnspecified.
  assert.equal(fields.includes('chat_id'), false);
  assert.equal(fields.includes('reply_markup'), false);
});

test('a table-less type does not swallow the following type', () => {
  assert.deepEqual(Object.keys(oracle.types.AbstractType.fields), []);
  assert.deepEqual(Object.keys(oracle.types.EmptyType.fields), []);
  assert.deepEqual(Object.keys(oracle.types.NextType.fields), ['name']);
  assert.equal(oracle.types.AbstractType.desc, 'Serves as the base type for other objects and documents no fields.');
  // EmptyType is immediately followed by another heading, so it has no prose either.
  assert.equal(oracle.types.EmptyType.desc, '');
});

test('anchor comes from the anchor name, never from lower-casing the heading', () => {
  // Fixture deliberately mismatches these two to pin the rule down.
  assert.equal(oracle.types.AbstractType.anchor, 'abstractpoint');
  assert.equal(oracle.methods.sendMessage.anchor, 'sendmessage');
});

test('a field is optional exactly when its description begins with Optional', () => {
  const { fields } = oracle.types.TestType;
  assert.equal(fields.identifier.optional, false);
  assert.equal(fields.payload.optional, false);
  assert.equal(fields.photo.optional, true);
  assert.equal(fields.rows.optional, true);
  assert.equal(fields.always.optional, true);
  assert.equal(fields.photo.desc, 'Optional. The photo & its caption');
});

test('type strings are read literally, including nested arrays and unions', () => {
  const { fields } = oracle.types.TestType;
  assert.equal(fields.identifier.type, 'Integer');
  assert.equal(fields.photo.type, 'PhotoSize');
  assert.equal(fields.rows.type, 'Array of Array of KeyboardButton');
  assert.equal(fields.payload.type, 'InputFile | String');
  assert.equal(fields.always.type, 'True');
  assert.equal(oracle.types.FloatType.fields.horizontal.type, 'Float');
});

test('entities and markup inside cells are decoded to literal text', () => {
  assert.equal(oracle.types.TestType.fields.payload.desc, 'File to send; pass a <file_id>');
  assert.equal(oracle.types.TestType.fields.photo.type, 'PhotoSize');
});

test('method parameters use the Required column when the table has one', () => {
  const { params } = oracle.methods.sendMessage;
  assert.deepEqual(Object.keys(params), ['chat_id', 'text', 'business_connection_id']);
  assert.equal(params.chat_id.optional, false);
  assert.equal(params.business_connection_id.optional, true);
  assert.equal(params.chat_id.type, 'Integer or String');
});

test('method parameters fall back to [square brackets] on the older 3-column table', () => {
  const { params } = oracle.methods.legacyMethod;
  assert.deepEqual(Object.keys(params), ['chat_id', 'disable_notification']);
  assert.equal(params.disable_notification.optional, true);
  assert.equal(params.chat_id.optional, false);
});

test('a method with no parameter table declares zero parameters', () => {
  assert.deepEqual(oracle.methods.getMe.params, {});
});

test('changelog dates and multi-word prose headings are never declarations', () => {
  assert.equal(oracle.types.TestType === undefined, false);
  for (const prose of ['June 1, 2025', 'Sending files', 'Stickers', 'Available types', 'Recent changes']) {
    assert.equal(oracle.types[prose], undefined, `${prose} must not be a type`);
    assert.equal(oracle.methods[prose], undefined, `${prose} must not be a method`);
  }
  assert.equal(oracle.anchors.includes('june-1-2025'), true);
});

test('classifyHeading only accepts h4 and splits on case + word count', () => {
  assert.equal(classifyHeading('getMe', 4), 'method');
  assert.equal(classifyHeading('ChatFullInfo', 4), 'type');
  assert.equal(classifyHeading('Sending files', 4), 'prose');
  assert.equal(classifyHeading('August 24, 2026', 4), 'prose');
  // Single-word PascalCase <h3> section titles must stay prose: they are what
  // pushed an earlier parser to 403 types instead of 400.
  assert.equal(classifyHeading('Stickers', 3), 'prose');
  assert.equal(classifyHeading('Payments', 3), 'prose');
  assert.equal(classifyHeading('Games', 3), 'prose');
});
