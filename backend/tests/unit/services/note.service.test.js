import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import noteService from '../../../src/services/note.service.js';
import noteRepository from '../../../src/repositories/note.repository.js';
import logger from '../../../src/utils/logger.js';
import ApiError from '../../../src/utils/ApiError.js';

const makeNote = (overrides = {}) => ({
  id: 'note-1',
  title: 'Groceries',
  content: 'milk',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const isNotFound = (err) => err instanceof ApiError && err.statusCode === 404;

let infoLog;

beforeEach(() => {
  infoLog = mock.method(logger, 'info', () => {});
});

afterEach(() => mock.restoreAll());

describe('getAllNotes', () => {
  it('returns notes most recently modified first and logs the action', async () => {
    const older = makeNote({ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' });
    const newer = makeNote({ id: 'b', updatedAt: '2026-02-01T00:00:00.000Z' });
    mock.method(noteRepository, 'findAll', async () => [older, newer]);

    const notes = await noteService.getAllNotes();

    assert.deepEqual(notes.map((n) => n.id), ['b', 'a']);
    assert.deepEqual(infoLog.mock.calls[0].arguments, ['Notes listed', { count: 2 }]);
  });
});

describe('getNoteById', () => {
  it('returns the note and logs the view', async () => {
    const note = makeNote();
    mock.method(noteRepository, 'findById', async () => note);

    assert.deepEqual(await noteService.getNoteById('note-1'), note);
    assert.deepEqual(infoLog.mock.calls[0].arguments, ['Note viewed', { noteId: 'note-1' }]);
  });

  it('throws 404 for a missing note without logging an action', async () => {
    mock.method(noteRepository, 'findById', async () => null);

    await assert.rejects(noteService.getNoteById('missing'), isNotFound);
    assert.equal(infoLog.mock.callCount(), 0);
  });
});

describe('createNote', () => {
  it('stores a new note and logs the creation', async () => {
    const create = mock.method(noteRepository, 'create', async (note) => note);

    const note = await noteService.createNote({ title: ' Groceries ', content: 'milk' });

    assert.equal(create.mock.callCount(), 1);
    assert.equal(note.title, 'Groceries');
    assert.equal(note.content, 'milk');
    assert.equal(note.createdAt, note.updatedAt);
    assert.deepEqual(infoLog.mock.calls[0].arguments, ['Note created', { noteId: note.id, title: 'Groceries' }]);
  });

  it('never logs note content', async () => {
    mock.method(noteRepository, 'create', async (note) => note);

    await noteService.createNote({ title: 'Diary', content: 'secret thoughts' });

    assert.ok(!JSON.stringify(infoLog.mock.calls).includes('secret thoughts'));
  });
});

describe('updateNote', () => {
  it('changes only the sent fields, refreshes updatedAt and logs the update', async () => {
    const existing = makeNote();
    mock.method(noteRepository, 'findById', async () => existing);
    const update = mock.method(noteRepository, 'update', async (id, changes) => ({ ...existing, ...changes }));

    const note = await noteService.updateNote('note-1', { content: 'milk, eggs' });

    const [id, changes] = update.mock.calls[0].arguments;
    assert.equal(id, 'note-1');
    assert.deepEqual(Object.keys(changes).sort(), ['content', 'updatedAt']);
    assert.ok(changes.updatedAt > existing.updatedAt);
    assert.equal(note.title, 'Groceries');
    assert.equal(note.content, 'milk, eggs');
    assert.deepEqual(infoLog.mock.calls[0].arguments, ['Note updated', { noteId: 'note-1', fields: ['content'] }]);
  });

  it('trims an updated title', async () => {
    mock.method(noteRepository, 'findById', async () => makeNote());
    const update = mock.method(noteRepository, 'update', async (id, changes) => changes);

    await noteService.updateNote('note-1', { title: '  Renamed  ' });

    assert.equal(update.mock.calls[0].arguments[1].title, 'Renamed');
  });

  it('throws 404 for a missing note and changes nothing', async () => {
    mock.method(noteRepository, 'findById', async () => null);
    const update = mock.method(noteRepository, 'update');

    await assert.rejects(noteService.updateNote('missing', { title: 'x' }), isNotFound);
    assert.equal(update.mock.callCount(), 0);
    assert.equal(infoLog.mock.callCount(), 0);
  });
});

describe('deleteNote', () => {
  it('removes the note and logs the deletion', async () => {
    mock.method(noteRepository, 'findById', async () => makeNote());
    const remove = mock.method(noteRepository, 'remove', async () => {});

    await noteService.deleteNote('note-1');

    assert.deepEqual(remove.mock.calls[0].arguments, ['note-1']);
    assert.deepEqual(infoLog.mock.calls[0].arguments, ['Note deleted', { noteId: 'note-1', title: 'Groceries' }]);
  });

  it('throws 404 for a missing note and removes nothing', async () => {
    mock.method(noteRepository, 'findById', async () => null);
    const remove = mock.method(noteRepository, 'remove');

    await assert.rejects(noteService.deleteNote('missing'), isNotFound);
    assert.equal(remove.mock.callCount(), 0);
    assert.equal(infoLog.mock.callCount(), 0);
  });
});
