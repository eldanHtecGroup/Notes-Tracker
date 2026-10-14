import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotes } from '../../../src/hooks/useNotes.js';
import notesApi from '../../../src/api/notesApi.js';
import { buildNote } from '../../helpers/fixtures.js';

vi.mock('../../../src/api/notesApi.js', () => ({
  default: { getNotes: vi.fn(), createNote: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn() },
}));

const older = buildNote({ id: 'a', title: 'Older', updatedAt: '2026-10-14T09:00:00.000Z' });
const newer = buildNote({ id: 'b', title: 'Newer', updatedAt: '2026-10-14T10:00:00.000Z' });

const renderLoaded = async (notes = [newer, older]) => {
  notesApi.getNotes.mockResolvedValue(notes);
  const hook = renderHook(() => useNotes());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notes on mount', async () => {
    const { result } = await renderLoaded();

    expect(notesApi.getNotes).toHaveBeenCalledTimes(1);
    expect(result.current.notes).toEqual([newer, older]);
    expect(result.current.error).toBeNull();
  });

  it('exposes the error message when loading fails, and reload retries', async () => {
    notesApi.getNotes.mockRejectedValueOnce(new Error('Server down'));
    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.error).toBe('Server down'));

    notesApi.getNotes.mockResolvedValueOnce([older]);
    await act(() => result.current.reload());

    expect(result.current.error).toBeNull();
    expect(result.current.notes).toEqual([older]);
  });

  it('createNote adds the created note to the top of the list', async () => {
    const { result } = await renderLoaded();
    const created = buildNote({ id: 'c', title: 'Fresh', updatedAt: '2026-10-14T11:00:00.000Z' });
    notesApi.createNote.mockResolvedValue(created);

    await act(() => result.current.createNote({ title: 'Fresh', content: '' }));

    expect(notesApi.createNote).toHaveBeenCalledWith({ title: 'Fresh', content: '' });
    expect(result.current.notes.map((n) => n.id)).toEqual(['c', 'b', 'a']);
  });

  it('updateNote replaces the note and moves it to the top', async () => {
    const { result } = await renderLoaded();
    const updated = { ...older, title: 'Edited', updatedAt: '2026-10-14T11:00:00.000Z' };
    notesApi.updateNote.mockResolvedValue(updated);

    await act(() => result.current.updateNote('a', { title: 'Edited' }));

    expect(notesApi.updateNote).toHaveBeenCalledWith('a', { title: 'Edited' });
    expect(result.current.notes).toEqual([updated, newer]);
  });

  it('deleteNote removes the note from the list', async () => {
    const { result } = await renderLoaded();
    notesApi.deleteNote.mockResolvedValue(null);

    await act(() => result.current.deleteNote('b'));

    expect(notesApi.deleteNote).toHaveBeenCalledWith('b');
    expect(result.current.notes).toEqual([older]);
  });

  it('rethrows mutation errors and leaves the list unchanged', async () => {
    const { result } = await renderLoaded();
    notesApi.deleteNote.mockRejectedValue(new Error('Note b not found'));

    await act(() => expect(result.current.deleteNote('b')).rejects.toThrow('Note b not found'));

    expect(result.current.notes).toEqual([newer, older]);
  });
});
