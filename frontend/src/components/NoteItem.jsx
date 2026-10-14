import { useState } from 'react';
import NoteForm from './NoteForm.jsx';
import { formatDate } from '../utils/formatDate.js';

function NoteItem({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async ({ title, content }) => {
    // Only send what changed, so an untouched note keeps its last-modified time
    const changes = {};
    if (title !== note.title) changes.title = title;
    if (content !== note.content) changes.content = content;

    if (Object.keys(changes).length > 0) await onUpdate(note.id, changes);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${note.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      await onDelete(note.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <li className="note-item note-item-editing" aria-label={`Editing ${note.title}`}>
        <NoteForm
          initialTitle={note.title}
          initialContent={note.content}
          submitLabel="Save changes"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="note-item" aria-label={note.title}>
      <h3 className="note-title">{note.title}</h3>
      {note.content ? (
        <p className="note-content">{note.content}</p>
      ) : (
        <p className="note-content note-content-empty">No content</p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <footer className="note-footer">
        <span className="note-modified">
          Last modified <time dateTime={note.updatedAt}>{formatDate(note.updatedAt)}</time>
        </span>
        <div className="note-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setError(null);
              setEditing(true);
            }}
            disabled={deleting}
          >
            Edit
          </button>
          <button type="button" className="button-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </footer>
    </li>
  );
}

export default NoteItem;
