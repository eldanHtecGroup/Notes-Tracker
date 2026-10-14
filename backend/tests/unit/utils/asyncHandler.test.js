import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import asyncHandler from '../../../src/utils/asyncHandler.js';

describe('asyncHandler', () => {
  it('runs the handler with req, res and next', async () => {
    const handler = mock.fn(async () => {});
    const next = mock.fn();
    const req = {};
    const res = {};

    await asyncHandler(handler)(req, res, next);

    assert.deepEqual(handler.mock.calls[0].arguments, [req, res, next]);
    assert.equal(next.mock.callCount(), 0);
  });

  it('forwards a rejected promise to next', async () => {
    const error = new Error('boom');
    const next = mock.fn();

    await asyncHandler(async () => {
      throw error;
    })({}, {}, next);

    assert.deepEqual(next.mock.calls[0].arguments, [error]);
  });
});
