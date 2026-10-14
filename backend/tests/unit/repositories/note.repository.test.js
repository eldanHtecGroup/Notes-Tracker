import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import noteRepository from '../../../src/repositories/note.repository.js';
import { buildNote } from '../../../src/models/note.model.js';

// Each test file runs in its own process, so the in-memory store starts empty here.
describe('note repository (in-memory)', () => {
  it('creates a note and finds it by id', async () => {
    const note = buildNote({ title: 'First' });
    assert.deepEqual(await noteRepository.create(note), note);
    assert.deepEqual(await noteRepository.findById(note.id), note);
  });

  it('returns null for an unknown id', async () => {
    assert.equal(await noteRepository.findById('missing'), null);
  });

  it('lists all notes', async () => {
    const second = await noteRepository.create(buildNote({ title: 'Second' }));
    const all = await noteRepository.findAll();
    assert.equal(all.length, 2);
    assert.ok(all.some((n) => n.id === second.id));
  });

  it('merges changes on update', async () => {
    const note = await noteRepository.create(buildNote({ title: 'Old', content: 'keep' }));
    const updated = await noteRepository.update(note.id, { title: 'New' });

    assert.equal(updated.title, 'New');
    assert.equal(updated.content, 'keep');
    assert.deepEqual(await noteRepository.findById(note.id), updated);
  });

  it('removes a note', async () => {
    const note = await noteRepository.create(buildNote({ title: 'Temp' }));
    await noteRepository.remove(note.id);
    assert.equal(await noteRepository.findById(note.id), null);
  });

  it('returns copies so stored notes cannot be changed from outside', async () => {
    const input = buildNote({ title: 'Safe' });
    const created = await noteRepository.create(input);
    input.title = 'changed input';
    created.title = 'changed result';
    (await noteRepository.findById(input.id)).title = 'changed lookup';

    assert.equal((await noteRepository.findById(input.id)).title, 'Safe');
  });
});
