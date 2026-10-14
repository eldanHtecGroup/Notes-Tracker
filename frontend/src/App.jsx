import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';
import { useNotes } from './hooks/useNotes.js';

function App() {
  const { notes, loading, error, reload, createNote, updateNote, deleteNote } = useNotes();

  const renderNotes = () => {
    if (loading) return <p className="status">Loading notes…</p>;
    if (error) {
      return (
        <div className="load-error" role="alert">
          <p>Could not load notes: {error}</p>
          <button type="button" className="button-secondary" onClick={reload}>
            Try again
          </button>
        </div>
      );
    }
    return <NoteList notes={notes} onUpdate={updateNote} onDelete={deleteNote} />;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Notes Tracker</h1>
        <p>Write, edit and keep track of your personal notes.</p>
      </header>

      <main>
        <section className="panel" aria-labelledby="new-note-heading">
          <h2 id="new-note-heading">New note</h2>
          <NoteForm submitLabel="Add note" onSubmit={createNote} resetOnSubmit />
        </section>

        <section aria-labelledby="notes-heading">
          <h2 id="notes-heading">
            Your notes {!loading && !error && <span className="count">({notes.length})</span>}
          </h2>
          {renderNotes()}
        </section>
      </main>
    </div>
  );
}

export default App;
