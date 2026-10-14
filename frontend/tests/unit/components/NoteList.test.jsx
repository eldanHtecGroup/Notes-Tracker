import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteList from '../../../src/components/NoteList.jsx';
import { buildNote } from '../../helpers/fixtures.js';

describe('NoteList', () => {
  it('renders every note in the given order', () => {
    const notes = [buildNote({ id: 'a', title: 'First' }), buildNote({ id: 'b', title: 'Second' })];
    render(<NoteList notes={notes} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First');
    expect(items[1]).toHaveTextContent('Second');
  });

  it('shows an empty state when there are no notes', () => {
    render(<NoteList notes={[]} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
