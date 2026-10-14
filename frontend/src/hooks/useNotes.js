import { useCallback, useEffect, useState } from 'react';
import notesApi from '../api/notesApi.js';
import { sortByLastModified } from '../utils/sortNotes.js';

// Owns the notes list and keeps it in sync with the backend.
// Mutations throw on failure so the calling component can show the error where it happened.
export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotes(await notesApi.getNotes());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(async (fields) => {
    const created = await notesApi.createNote(fields);
    setNotes((current) => sortByLastModified([created, ...current]));
    return created;
  }, []);

  const updateNote = useCallback(async (id, changes) => {
    const updated = await notesApi.updateNote(id, changes);
    setNotes((current) => sortByLastModified(current.map((note) => (note.id === id ? updated : note))));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id) => {
    await notesApi.deleteNote(id);
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  return { notes, loading, error, reload: loadNotes, createNote, updateNote, deleteNote };
};

export default useNotes;
