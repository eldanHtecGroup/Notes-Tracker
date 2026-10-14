export const buildNote = (overrides = {}) => ({
  id: 'note-1',
  title: 'Groceries',
  content: 'milk, eggs',
  createdAt: '2026-10-14T09:00:00.000Z',
  updatedAt: '2026-10-14T09:00:00.000Z',
  ...overrides,
});

export const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
