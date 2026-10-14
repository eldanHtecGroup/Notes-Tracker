import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import notFound from '../../../src/middlewares/notFound.js';

describe('notFound middleware', () => {
  it('passes a 404 naming the unknown route', () => {
    const next = mock.fn();
    notFound({ method: 'GET', originalUrl: '/api/nope' }, {}, next);

    const [err] = next.mock.calls[0].arguments;
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, 'Route GET /api/nope not found');
  });
});
