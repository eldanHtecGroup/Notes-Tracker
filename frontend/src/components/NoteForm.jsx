import { useId, useState } from 'react';
import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from '../constants.js';

// Used both to add a new note and to edit an existing one.
// `onSubmit` receives { title, content } and may throw; its message is shown in the form.
function NoteForm({ initialTitle = '', initialContent = '', submitLabel, onSubmit, onCancel, resetOnSubmit = false }) {
  const id = useId();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), content });
      if (resetOnSubmit) {
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${id}-title`}>Title</label>
      <input
        id={`${id}-title`}
        type="text"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Note title"
        onChange={(event) => setTitle(event.target.value)}
        disabled={submitting}
        aria-invalid={error === 'Title is required.'}
      />

      <label htmlFor={`${id}-content`}>Content</label>
      <textarea
        id={`${id}-content`}
        value={content}
        maxLength={CONTENT_MAX_LENGTH}
        placeholder="Write your note…"
        rows={5}
        onChange={(event) => setContent(event.target.value)}
        disabled={submitting}
      />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="button-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default NoteForm;
