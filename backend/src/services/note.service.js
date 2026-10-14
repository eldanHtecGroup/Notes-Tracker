import noteRepository from '../repositories/note.repository.js';
import { buildNote } from '../models/note.model.js';
import ApiError from '../utils/ApiError.js';

// Services hold business logic and know nothing about req/res.
const getAllNotes = () => noteRepository.findAll();

const getNoteById = async (id) => {
  const note = await noteRepository.findById(id);
  if (!note) throw ApiError.notFound(`Note ${id} not found`);
  return note;
};

const createNote = ({ title, content }) => noteRepository.create(buildNote({ title, content }));

const updateNote = async (id, { title, content }) => {
  await getNoteById(id);
  const changes = { updatedAt: new Date().toISOString() };
  if (title !== undefined) changes.title = title;
  if (content !== undefined) changes.content = content;
  return noteRepository.update(id, changes);
};

const deleteNote = async (id) => {
  await getNoteById(id);
  await noteRepository.remove(id);
};

export default { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
