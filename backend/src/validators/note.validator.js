// Each schema returns a list of error messages; empty means valid.
export const createNoteSchema = (body) => {
  const errors = [];
  if (typeof body.title !== 'string' || !body.title.trim()) errors.push('title is required');
  if (body.content !== undefined && typeof body.content !== 'string') errors.push('content must be a string');
  return errors;
};

export const updateNoteSchema = (body) => {
  const errors = [];
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) {
    errors.push('title must be a non-empty string');
  }
  if (body.content !== undefined && typeof body.content !== 'string') errors.push('content must be a string');
  return errors;
};
