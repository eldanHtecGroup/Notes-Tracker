import noteService from '../services/note.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Controllers handle HTTP only: read the request, call a service, send the response.
const getAll = asyncHandler(async (req, res) => {
  const notes = await noteService.getAllNotes();
  res.json({ data: notes });
});

const getById = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.params.id);
  res.json({ data: note });
});

const create = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.body);
  res.status(201).json({ data: note });
});

const update = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.body);
  res.json({ data: note });
});

const remove = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id);
  res.status(204).send();
});

export default { getAll, getById, create, update, remove };
