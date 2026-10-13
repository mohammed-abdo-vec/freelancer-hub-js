import { useState } from 'react';
import { useMe } from '../features/auth/hooks';
import { useAddNote, useDeleteNote, useNotes } from '../features/notes/hooks';
import { getErrorMessage } from '../lib/http';
import { Spinner } from '../components/Spinner';

export function DashboardPage() {
  const { data: user } = useMe();
  const notes = useNotes();
  const addNote = useAddNote();
  const deleteNote = useDeleteNote();
  const [text, setText] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNote.mutate(text, { onSuccess: () => setText('') });
  };

  return (
    <section className="card">
      <p className="eyebrow">Dashboard</p>
      <h1>Hi {user?.name.split(' ')[0] ?? 'there'} 👋</h1>
      <p className="muted">
        These notes come from a protected endpoint. Wait for the token to expire (watch the debug panel), then
        add a note — the 401 → refresh → retry happens without you noticing.
      </p>

      <form onSubmit={handleAdd} className="row">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note…" />
        <button className="btn btn--primary" disabled={addNote.isPending}>
          {addNote.isPending ? 'Saving…' : 'Add'}
        </button>
      </form>
      {addNote.isError && <p className="form__error">{getErrorMessage(addNote.error)}</p>}

      {/* The three states every query has: pending, error, success */}
      {notes.isPending ? (
        <Spinner label="Loading notes…" />
      ) : notes.isError ? (
        <p className="form__error">{getErrorMessage(notes.error)}</p>
      ) : notes.data.length === 0 ? (
        <p className="muted">No notes yet.</p>
      ) : (
        <ul className="notes">
          {notes.data.map((note) => (
            <li key={note.id}>
              <span>{note.text}</span>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => deleteNote.mutate(note.id)}
                disabled={deleteNote.isPending && deleteNote.variables === note.id}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* isFetching = background refetch (data already on screen) */}
      {notes.isFetching && !notes.isPending && <p className="muted small">Refreshing…</p>}
    </section>
  );
}
