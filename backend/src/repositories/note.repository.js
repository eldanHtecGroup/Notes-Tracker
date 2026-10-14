// Repositories are the only layer that touches the data source.
// In-memory store for now; swap for a real database without changing services.
const notes = new Map();

const findAll = async () => [...notes.values()];

const findById = async (id) => notes.get(id) ?? null;

const create = async (note) => {
  notes.set(note.id, note);
  return note;
};

const update = async (id, changes) => {
  const updated = { ...notes.get(id), ...changes };
  notes.set(id, updated);
  return updated;
};

const remove = async (id) => notes.delete(id);

export default { findAll, findById, create, update, remove };
