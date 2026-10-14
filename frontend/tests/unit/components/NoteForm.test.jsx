import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '../../../src/components/NoteForm.jsx';

describe('NoteForm', () => {
  it('submits the trimmed title and the content', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    render(<NoteForm submitLabel="Add note" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), '  Groceries  ');
    await user.type(screen.getByLabelText('Content'), 'milk, eggs');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Groceries', content: 'milk, eggs' });
  });

  it('requires a title and does not submit without one', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NoteForm submitLabel="Add note" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
  });

  it('clears the fields after a successful submit when resetOnSubmit is set', async () => {
    const user = userEvent.setup();
    render(<NoteForm submitLabel="Add note" onSubmit={vi.fn().mockResolvedValue()} resetOnSubmit />);

    await user.type(screen.getByLabelText('Title'), 'Groceries');
    await user.type(screen.getByLabelText('Content'), 'milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Content')).toHaveValue('');
  });

  it('shows the error and keeps the input when submit fails', async () => {
    const user = userEvent.setup();
    render(<NoteForm submitLabel="Add note" onSubmit={vi.fn().mockRejectedValue(new Error('Validation failed'))} resetOnSubmit />);

    await user.type(screen.getByLabelText('Title'), 'Groceries');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Validation failed');
    expect(screen.getByLabelText('Title')).toHaveValue('Groceries');
  });

  it('prefills initial values and calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <NoteForm initialTitle="Old" initialContent="Body" submitLabel="Save changes" onSubmit={vi.fn()} onCancel={onCancel} />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Old');
    expect(screen.getByLabelText('Content')).toHaveValue('Body');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('enforces the backend length limits on the inputs', () => {
    render(<NoteForm submitLabel="Add note" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Title')).toHaveAttribute('maxlength', '200');
    expect(screen.getByLabelText('Content')).toHaveAttribute('maxlength', '50000');
  });
});
