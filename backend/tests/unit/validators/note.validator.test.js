import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createNoteSchema, updateNoteSchema } from '../../../src/validators/note.validator.js';
import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from '../../../src/models/note.model.js';

describe('createNoteSchema', () => {
  it('accepts a title with or without content', () => {
    assert.deepEqual(createNoteSchema({ title: 'Groceries' }), []);
    assert.deepEqual(createNoteSchema({ title: 'Groceries', content: 'milk' }), []);
  });

  it('requires a non-empty title', () => {
    assert.deepEqual(createNoteSchema({}), ['title must be a non-empty string']);
    assert.deepEqual(createNoteSchema({ title: '   ' }), ['title must be a non-empty string']);
    assert.deepEqual(createNoteSchema({ title: 42 }), ['title must be a non-empty string']);
  });

  it('limits title length after trimming', () => {
    assert.deepEqual(createNoteSchema({ title: ` ${'x'.repeat(TITLE_MAX_LENGTH)} ` }), []);
    assert.equal(createNoteSchema({ title: 'x'.repeat(TITLE_MAX_LENGTH + 1) }).length, 1);
  });

  it('requires content to be a string within the length limit', () => {
    assert.deepEqual(createNoteSchema({ title: 'ok', content: 5 }), ['content must be a string']);
    assert.equal(createNoteSchema({ title: 'ok', content: 'x'.repeat(CONTENT_MAX_LENGTH + 1) }).length, 1);
  });

  it('reports every problem at once', () => {
    assert.equal(createNoteSchema({ content: 5 }).length, 2);
  });
});

describe('updateNoteSchema', () => {
  it('accepts title only, content only, or both', () => {
    assert.deepEqual(updateNoteSchema({ title: 'New' }), []);
    assert.deepEqual(updateNoteSchema({ content: '' }), []);
    assert.deepEqual(updateNoteSchema({ title: 'New', content: 'body' }), []);
  });

  it('rejects an update with nothing to change', () => {
    assert.deepEqual(updateNoteSchema({}), ['provide at least one of: title, content']);
  });

  it('validates the fields that are sent', () => {
    assert.deepEqual(updateNoteSchema({ title: '' }), ['title must be a non-empty string']);
    assert.deepEqual(updateNoteSchema({ content: null }), ['content must be a string']);
  });
});
