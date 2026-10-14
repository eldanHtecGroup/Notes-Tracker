import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import validate from '../../../src/middlewares/validate.js';
import ApiError from '../../../src/utils/ApiError.js';

describe('validate middleware', () => {
  it('calls next with no error when the body is valid', () => {
    const next = mock.fn();
    validate(() => [])({ body: { title: 'ok' } }, {}, next);

    assert.deepEqual(next.mock.calls[0].arguments, []);
  });

  it('passes a 400 ApiError with the details when the body is invalid', () => {
    const next = mock.fn();
    validate(() => ['title is required'])({ body: {} }, {}, next);

    const [err] = next.mock.calls[0].arguments;
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 400);
    assert.deepEqual(err.details, ['title is required']);
  });

  it('validates an empty object when the request has no body', () => {
    const schema = mock.fn(() => []);
    validate(schema)({}, {}, mock.fn());

    assert.deepEqual(schema.mock.calls[0].arguments, [{}]);
  });
});
