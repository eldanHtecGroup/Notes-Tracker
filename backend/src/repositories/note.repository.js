// Repositories are the only layer that touches the data source.
// In-memory store: data lives for the lifetime of the process and is lost on restart.
// Swap for a real database without changing services.
const notes = new Map();

// Copies are returned so callers can't mutate stored notes by accident.
const clone = (note) => (note ? { ...note } : null);

const findAll = async () => [...notes.values()].map(clone);

const findById = async (id) => clone(notes.get(id));

const create = async (note) => {
  notes.set(note.id, { ...note });
  return clone(note);
};

const update = async (id, changes) => {
  const updated = { ...notes.get(id), ...changes };
  notes.set(id, updated);
  return clone(updated);
};

const remove = async (id) => {
  notes.delete(id);
};

export default { findAll, findById, create, update, remove };
