import { randomUUID } from 'node:crypto';

export const buildNote = ({ title, content = '' }) => {
  const now = new Date().toISOString();
  return { id: randomUUID(), title, content, createdAt: now, updatedAt: now };
};
