import NoteItem from './NoteItem.jsx';

function NoteList({ notes, onUpdate, onDelete }) {
  if (notes.length === 0) {
    return <p className="empty-state">No notes yet. Add your first one above.</p>;
  }

  return (
    <ul className="note-list" aria-label="Saved notes">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default NoteList;
