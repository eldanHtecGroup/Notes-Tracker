import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Set before the app (and its config) loads so request logging stays quiet.
process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api/notes`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const request = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};

test('create, list, update and delete a note', async () => {
  const created = await request('POST', baseUrl, { title: '  Groceries ', content: 'milk' });
  assert.equal(created.status, 201);
  const note = created.body.data;
  assert.equal(note.title, 'Groceries');
  assert.equal(note.createdAt, note.updatedAt);

  const second = (await request('POST', baseUrl, { title: 'Ideas' })).body.data;
  assert.equal(second.content, '');

  await new Promise((resolve) => setTimeout(resolve, 5));
  const updated = await request('PATCH', `${baseUrl}/${note.id}`, { content: 'milk, eggs' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.title, 'Groceries');
  assert.equal(updated.body.data.content, 'milk, eggs');
  assert.ok(updated.body.data.updatedAt > note.updatedAt);
  assert.equal(updated.body.data.createdAt, note.createdAt);

  const list = await request('GET', baseUrl);
  assert.deepEqual(list.body.data.map((n) => n.id), [note.id, second.id], 'most recently modified first');

  assert.equal((await request('DELETE', `${baseUrl}/${note.id}`)).status, 204);
  assert.equal((await request('GET', `${baseUrl}/${note.id}`)).status, 404);
  assert.equal((await request('DELETE', `${baseUrl}/${note.id}`)).status, 404);
});

test('rejects invalid input', async () => {
  assert.equal((await request('POST', baseUrl, {})).status, 400);
  assert.equal((await request('POST', baseUrl, { title: '   ' })).status, 400);
  assert.equal((await request('POST', baseUrl, { title: 'x'.repeat(201) })).status, 400);
  assert.equal((await request('POST', baseUrl, { title: 'ok', content: 5 })).status, 400);

  const note = (await request('POST', baseUrl, { title: 'Keep' })).body.data;
  const empty = await request('PATCH', `${baseUrl}/${note.id}`, {});
  assert.equal(empty.status, 400);
  assert.deepEqual(empty.body.error.details, ['provide at least one of: title, content']);
});
