import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from '../models/note.model.js';

// Each schema returns a list of error messages; empty means valid.
const checkTitle = (title, errors) => {
  if (typeof title !== 'string' || !title.trim()) errors.push('title must be a non-empty string');
  else if (title.trim().length > TITLE_MAX_LENGTH) errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters`);
};

const checkContent = (content, errors) => {
  if (typeof content !== 'string') errors.push('content must be a string');
  else if (content.length > CONTENT_MAX_LENGTH) errors.push(`content must be at most ${CONTENT_MAX_LENGTH} characters`);
};

export const createNoteSchema = (body) => {
  const errors = [];
  checkTitle(body.title, errors);
  if (body.content !== undefined) checkContent(body.content, errors);
  return errors;
};

export const updateNoteSchema = (body) => {
  const errors = [];
  if (body.title === undefined && body.content === undefined) {
    errors.push('provide at least one of: title, content');
  }
  if (body.title !== undefined) checkTitle(body.title, errors);
  if (body.content !== undefined) checkContent(body.content, errors);
  return errors;
};
