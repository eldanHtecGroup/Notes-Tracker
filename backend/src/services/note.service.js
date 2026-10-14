import noteRepository from '../repositories/note.repository.js';
import { buildNote } from '../models/note.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

// Services hold business logic and know nothing about req/res.
// Every user action is logged here; failed attempts are logged by the error handler.
// Note content is never logged.

const findNoteOrThrow = async (id) => {
  const note = await noteRepository.findById(id);
  if (!note) throw ApiError.notFound(`Note ${id} not found`);
  return note;
};

// Most recently modified first (ISO timestamps sort correctly as strings).
const getAllNotes = async () => {
  const notes = await noteRepository.findAll();
  logger.info('Notes listed', { count: notes.length });
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

const getNoteById = async (id) => {
  const note = await findNoteOrThrow(id);
  logger.info('Note viewed', { noteId: id });
  return note;
};

const createNote = async ({ title, content }) => {
  const note = await noteRepository.create(buildNote({ title, content }));
  logger.info('Note created', { noteId: note.id, title: note.title });
  return note;
};

// Only fields that are sent get changed; every update refreshes updatedAt.
const updateNote = async (id, { title, content }) => {
  await findNoteOrThrow(id);
  const changes = {};
  if (title !== undefined) changes.title = title.trim();
  if (content !== undefined) changes.content = content;
  const note = await noteRepository.update(id, { ...changes, updatedAt: new Date().toISOString() });
  logger.info('Note updated', { noteId: id, fields: Object.keys(changes) });
  return note;
};

const deleteNote = async (id) => {
  const note = await findNoteOrThrow(id);
  await noteRepository.remove(id);
  logger.info('Note deleted', { noteId: id, title: note.title });
};

export default { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
