import { randomUUID } from 'node:crypto';

export const TITLE_MAX_LENGTH = 200;
export const CONTENT_MAX_LENGTH = 50000;

// updatedAt is the note's "last modified" time; it starts equal to createdAt.
export const buildNote = ({ title, content = '' }) => {
  const now = new Date().toISOString();
  return { id: randomUUID(), title: title.trim(), content, createdAt: now, updatedAt: now };
};
