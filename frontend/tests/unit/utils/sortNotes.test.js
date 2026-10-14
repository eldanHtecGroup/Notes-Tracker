import { describe, it, expect } from 'vitest';
import { sortByLastModified } from '../../../src/utils/sortNotes.js';
import { buildNote } from '../../helpers/fixtures.js';

describe('sortByLastModified', () => {
  it('puts the most recently modified note first without mutating the input', () => {
    const older = buildNote({ id: 'a', updatedAt: '2026-10-14T09:00:00.000Z' });
    const newer = buildNote({ id: 'b', updatedAt: '2026-10-14T10:00:00.000Z' });
    const input = [older, newer];

    expect(sortByLastModified(input).map((n) => n.id)).toEqual(['b', 'a']);
    expect(input.map((n) => n.id)).toEqual(['a', 'b']);
  });
});
