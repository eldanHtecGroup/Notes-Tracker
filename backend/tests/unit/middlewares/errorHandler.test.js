import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import errorHandler from '../../../src/middlewares/errorHandler.js';
import config from '../../../src/config/index.js';
import logger from '../../../src/utils/logger.js';
import ApiError from '../../../src/utils/ApiError.js';
import { createResponse } from '../../helpers/mockResponse.js';

const req = { method: 'PATCH', originalUrl: '/api/notes/1' };
const originalEnv = config.env;

let warnLog;
let errorLog;

beforeEach(() => {
  warnLog = mock.method(logger, 'warn', () => {});
  errorLog = mock.method(logger, 'error', () => {});
});

afterEach(() => {
  mock.restoreAll();
  config.env = originalEnv;
});

describe('errorHandler middleware', () => {
  it('responds with the client error and logs it as a warning', () => {
    const res = createResponse();
    errorHandler(ApiError.notFound('Note 1 not found'), req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { error: { message: 'Note 1 not found' } });
    assert.deepEqual(warnLog.mock.calls[0].arguments, [
      'Request rejected: Note 1 not found',
      { method: 'PATCH', path: '/api/notes/1', status: 404 },
    ]);
    assert.equal(errorLog.mock.callCount(), 0);
  });

  it('includes validation details in the response and the log', () => {
    const res = createResponse();
    errorHandler(ApiError.badRequest('Validation failed', ['title is required']), req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.error.details, ['title is required']);
    assert.deepEqual(warnLog.mock.calls[0].arguments[1].details, ['title is required']);
  });

  it('uses the status of non-ApiError errors such as malformed JSON', () => {
    const res = createResponse();
    errorHandler(Object.assign(new Error('Unexpected token'), { status: 400 }), req, res, () => {});

    assert.equal(res.statusCode, 400);
  });

  it('treats unknown errors as 500 and logs them as errors', () => {
    config.env = 'development';
    const err = new Error('boom');
    const res = createResponse();
    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error.message, 'boom');
    assert.equal(res.body.error.stack, err.stack);
    assert.deepEqual(errorLog.mock.calls[0].arguments, [
      'Request failed',
      { method: 'PATCH', path: '/api/notes/1', status: 500, error: err },
    ]);
  });

  it('hides server error details in production', () => {
    config.env = 'production';
    const res = createResponse();
    errorHandler(new Error('db password wrong'), req, res, () => {});

    assert.deepEqual(res.body, { error: { message: 'Internal Server Error' } });
  });
});
