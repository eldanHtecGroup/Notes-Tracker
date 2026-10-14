import { describe, it, expect } from 'vitest';
import { formatDate } from '../../../src/utils/formatDate.js';

describe('formatDate', () => {
  it('formats an ISO timestamp as a readable date and time', () => {
    const iso = '2026-10-14T09:25:00.000Z';
    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

    expect(formatDate(iso)).toBe(expected);
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatDate('not a date')).toBe('');
  });
});
