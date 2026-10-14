import { describe, it, expect, vi, beforeEach } from 'vitest';
import notesApi, { ApiError } from '../../../src/api/notesApi.js';
import { buildNote, jsonResponse } from '../../helpers/fixtures.js';

describe('notesApi', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('getNotes requests GET /api/notes and unwraps data', async () => {
    const notes = [buildNote()];
    fetchMock.mockResolvedValue(jsonResponse(200, { data: notes }));

    await expect(notesApi.getNotes()).resolves.toEqual(notes);
    expect(fetchMock).toHaveBeenCalledWith('/api/notes', expect.objectContaining({ headers: expect.any(Object) }));
  });

  it('createNote POSTs title and content', async () => {
    const note = buildNote();
    fetchMock.mockResolvedValue(jsonResponse(201, { data: note }));

    await expect(notesApi.createNote({ title: 'Groceries', content: 'milk, eggs' })).resolves.toEqual(note);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/notes');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ title: 'Groceries', content: 'milk, eggs' });
  });

  it('updateNote PATCHes only the given changes', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: buildNote({ title: 'New' }) }));

    await notesApi.updateNote('note-1', { title: 'New' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/notes/note-1');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ title: 'New' });
  });

  it('deleteNote sends DELETE and resolves to null on 204', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, json: vi.fn() });

    await expect(notesApi.deleteNote('note-1')).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/notes/note-1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('throws an ApiError with the backend message and details on error responses', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { error: { message: 'Validation failed', details: ['title must be a non-empty string'] } }),
    );

    const error = await notesApi.createNote({ title: '' }).catch((err) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Validation failed');
    expect(error.details).toEqual(['title must be a non-empty string']);
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 502, json: async () => { throw new SyntaxError(); } });

    await expect(notesApi.getNotes()).rejects.toThrow('Request failed with status 502');
  });

  it('throws a friendly ApiError when the server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(notesApi.getNotes()).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/could not reach/i) });
  });
});
