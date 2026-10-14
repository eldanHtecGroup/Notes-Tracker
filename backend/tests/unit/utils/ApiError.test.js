import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ApiError from '../../../src/utils/ApiError.js';

describe('ApiError', () => {
  it('is an Error carrying a status code and optional details', () => {
    const err = new ApiError(418, 'teapot', ['short and stout']);

    assert.ok(err instanceof Error);
    assert.equal(err.statusCode, 418);
    assert.equal(err.message, 'teapot');
    assert.deepEqual(err.details, ['short and stout']);
  });

  it('has factories for common statuses with default messages', () => {
    assert.equal(ApiError.badRequest().statusCode, 400);
    assert.equal(ApiError.badRequest().message, 'Bad Request');
    assert.deepEqual(ApiError.badRequest('Invalid', ['x']).details, ['x']);
    assert.equal(ApiError.notFound().statusCode, 404);
    assert.equal(ApiError.notFound('Gone').message, 'Gone');
    assert.equal(ApiError.internal().statusCode, 500);
  });
});
