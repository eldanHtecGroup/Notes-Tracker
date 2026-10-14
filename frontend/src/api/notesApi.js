const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Unwraps the backend's `{ data }` envelope and turns `{ error }` responses into an ApiError.
const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Is the backend running?');
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const { message, details } = body?.error ?? {};
    throw new ApiError(response.status, message || `Request failed with status ${response.status}`, details);
  }
  return body?.data;
};

export const getNotes = () => request('/notes');

export const createNote = ({ title, content }) =>
  request('/notes', { method: 'POST', body: JSON.stringify({ title, content }) });

export const updateNote = (id, changes) =>
  request(`/notes/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) });

export const deleteNote = (id) => request(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });

export default { getNotes, createNote, updateNote, deleteNote };
