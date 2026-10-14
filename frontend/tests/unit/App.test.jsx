import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
import notesApi from '../../src/api/notesApi.js';
import { buildNote } from '../helpers/fixtures.js';

vi.mock('../../src/api/notesApi.js', () => ({
  default: { getNotes: vi.fn(), createNote: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn() },
}));

const existing = buildNote({ id: 'a', title: 'Existing', updatedAt: '2026-10-14T09:00:00.000Z' });

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state, then the saved notes', async () => {
    notesApi.getNotes.mockResolvedValue([existing]);
    render(<App />);

    expect(screen.getByText(/loading notes/i)).toBeInTheDocument();
    expect(await screen.findByRole('listitem', { name: 'Existing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your notes/i })).toHaveTextContent('(1)');
  });

  it('adds a new note to the list', async () => {
    const user = userEvent.setup();
    notesApi.getNotes.mockResolvedValue([existing]);
    notesApi.createNote.mockResolvedValue(
      buildNote({ id: 'b', title: 'Brand new', content: 'hello', updatedAt: '2026-10-14T10:00:00.000Z' }),
    );
    render(<App />);
    await screen.findByRole('listitem', { name: 'Existing' });

    const newNote = screen.getByRole('region', { name: 'New note' });
    await user.type(within(newNote).getByLabelText('Title'), 'Brand new');
    await user.type(within(newNote).getByLabelText('Content'), 'hello');
    await user.click(within(newNote).getByRole('button', { name: 'Add note' }));

    const items = await screen.findAllByRole('listitem');
    expect(items[0]).toHaveAccessibleName('Brand new');
    expect(notesApi.createNote).toHaveBeenCalledWith({ title: 'Brand new', content: 'hello' });
  });

  it('edits and deletes a note', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    notesApi.getNotes.mockResolvedValue([existing]);
    notesApi.updateNote.mockResolvedValue({ ...existing, title: 'Renamed', updatedAt: '2026-10-14T10:00:00.000Z' });
    notesApi.deleteNote.mockResolvedValue(null);
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const editing = screen.getByRole('listitem', { name: 'Editing Existing' });
    await user.clear(within(editing).getByLabelText('Title'));
    await user.type(within(editing).getByLabelText('Title'), 'Renamed');
    await user.click(within(editing).getByRole('button', { name: 'Save changes' }));

    const renamed = await screen.findByRole('listitem', { name: 'Renamed' });
    await user.click(within(renamed).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();
    expect(notesApi.deleteNote).toHaveBeenCalledWith('a');
  });

  it('shows a load error with a retry button', async () => {
    const user = userEvent.setup();
    notesApi.getNotes.mockRejectedValueOnce(new Error('Could not reach the server.')).mockResolvedValueOnce([existing]);
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('listitem', { name: 'Existing' })).toBeInTheDocument();
  });
});
