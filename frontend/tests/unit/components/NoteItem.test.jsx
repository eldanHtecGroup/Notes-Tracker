import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteItem from '../../../src/components/NoteItem.jsx';
import { formatDate } from '../../../src/utils/formatDate.js';
import { buildNote } from '../../helpers/fixtures.js';

const note = buildNote({ updatedAt: '2026-10-14T09:25:00.000Z' });

const renderItem = (props = {}) => {
  const handlers = { onUpdate: vi.fn().mockResolvedValue(), onDelete: vi.fn().mockResolvedValue(), ...props };
  render(
    <ul>
      <NoteItem note={note} {...handlers} />
    </ul>,
  );
  return handlers;
};

describe('NoteItem', () => {
  it('shows the title, content and last-modified time', () => {
    renderItem();

    expect(screen.getByRole('heading', { name: 'Groceries' })).toBeInTheDocument();
    expect(screen.getByText('milk, eggs')).toBeInTheDocument();
    const time = screen.getByText(formatDate(note.updatedAt));
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', note.updatedAt);
    expect(time.parentElement).toHaveTextContent(/last modified/i);
  });

  it('shows a placeholder when the note has no content', () => {
    render(
      <ul>
        <NoteItem note={buildNote({ content: '' })} onUpdate={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );

    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('edits a note, sending only the changed fields', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderItem();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Shopping');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onUpdate).toHaveBeenCalledWith('note-1', { title: 'Shopping' });
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });

  it('does not call onUpdate when nothing changed', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderItem();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('keeps the edit form open and shows the error when saving fails', async () => {
    const user = userEvent.setup();
    renderItem({ onUpdate: vi.fn().mockRejectedValue(new Error('Note note-1 not found')) });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Content'), ', bread');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Note note-1 not found');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('cancelling an edit restores the read-only view', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderItem();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Title'), ' changed');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Groceries' })).toBeInTheDocument();
  });

  it('deletes the note after confirmation', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onDelete } = renderItem();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Groceries'));
    expect(onDelete).toHaveBeenCalledWith('note-1');
  });

  it('does not delete when the confirmation is dismissed', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { onDelete } = renderItem();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows the error and re-enables the buttons when deleting fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderItem({ onDelete: vi.fn().mockRejectedValue(new Error('Server error')) });

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const item = screen.getByRole('listitem');
    expect(await within(item).findByRole('alert')).toHaveTextContent('Server error');
    expect(within(item).getByRole('button', { name: 'Delete' })).toBeEnabled();
  });
});
