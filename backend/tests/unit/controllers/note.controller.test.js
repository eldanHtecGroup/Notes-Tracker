import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import noteController from '../../../src/controllers/note.controller.js';
import noteService from '../../../src/services/note.service.js';
import { createResponse } from '../../helpers/mockResponse.js';

const note = { id: 'note-1', title: 'Groceries', content: 'milk' };

afterEach(() => mock.restoreAll());

describe('note controller', () => {
  it('getAll responds with all notes', async () => {
    mock.method(noteService, 'getAllNotes', async () => [note]);
    const res = createResponse();

    await noteController.getAll({}, res, mock.fn());

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { data: [note] });
  });

  it('getById looks up the note from the URL id', async () => {
    const getNoteById = mock.method(noteService, 'getNoteById', async () => note);
    const res = createResponse();

    await noteController.getById({ params: { id: 'note-1' } }, res, mock.fn());

    assert.deepEqual(getNoteById.mock.calls[0].arguments, ['note-1']);
    assert.deepEqual(res.body, { data: note });
  });

  it('create responds 201 with the new note', async () => {
    const createNote = mock.method(noteService, 'createNote', async () => note);
    const res = createResponse();
    const body = { title: 'Groceries', content: 'milk' };

    await noteController.create({ body }, res, mock.fn());

    assert.deepEqual(createNote.mock.calls[0].arguments, [body]);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, { data: note });
  });

  it('update passes the id and body to the service', async () => {
    const updateNote = mock.method(noteService, 'updateNote', async () => note);
    const res = createResponse();

    await noteController.update({ params: { id: 'note-1' }, body: { title: 'New' } }, res, mock.fn());

    assert.deepEqual(updateNote.mock.calls[0].arguments, ['note-1', { title: 'New' }]);
    assert.deepEqual(res.body, { data: note });
  });

  it('remove responds 204 with no body', async () => {
    const deleteNote = mock.method(noteService, 'deleteNote', async () => {});
    const res = createResponse();

    await noteController.remove({ params: { id: 'note-1' } }, res, mock.fn());

    assert.deepEqual(deleteNote.mock.calls[0].arguments, ['note-1']);
    assert.equal(res.statusCode, 204);
    assert.equal(res.body, undefined);
  });

  it('forwards service errors to next', async () => {
    const error = new Error('boom');
    mock.method(noteService, 'getAllNotes', async () => {
      throw error;
    });
    const next = mock.fn();

    await noteController.getAll({}, createResponse(), next);

    assert.deepEqual(next.mock.calls[0].arguments, [error]);
  });
});
