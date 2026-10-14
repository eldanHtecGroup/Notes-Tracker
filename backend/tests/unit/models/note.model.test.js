import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNote } from '../../../src/models/note.model.js';

describe('buildNote', () => {
  it('creates a note with an id, trimmed title and matching timestamps', () => {
    const note = buildNote({ title: '  Groceries  ', content: 'milk' });

    assert.match(note.id, /^[0-9a-f-]{36}$/);
    assert.equal(note.title, 'Groceries');
    assert.equal(note.content, 'milk');
    assert.ok(!Number.isNaN(Date.parse(note.createdAt)));
    assert.equal(note.updatedAt, note.createdAt);
  });

  it('defaults content to an empty string', () => {
    assert.equal(buildNote({ title: 'Ideas' }).content, '');
  });

  it('gives every note a unique id', () => {
    assert.notEqual(buildNote({ title: 'a' }).id, buildNote({ title: 'a' }).id);
  });
});
