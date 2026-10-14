import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import logger from '../../../src/utils/logger.js';
import config from '../../../src/config/index.js';

const originalLevel = config.logLevel;

let stdout;
let stderr;

beforeEach(() => {
  stdout = mock.method(console, 'log', () => {});
  stderr = mock.method(console, 'error', () => {});
  config.logLevel = 'debug';
});

afterEach(() => {
  mock.restoreAll();
  config.logLevel = originalLevel;
});

describe('logger', () => {
  it('writes a timestamped line with the level, message and metadata', () => {
    logger.info('Note created', { noteId: 'note-1' });

    const [line] = stdout.mock.calls[0].arguments;
    assert.match(line, /^\d{4}-\d{2}-\d{2}T\S+Z INFO  Note created \{"noteId":"note-1"\}$/);
  });

  it('omits metadata when there is none', () => {
    logger.debug('Ping');

    assert.match(stdout.mock.calls[0].arguments[0], /DEBUG Ping$/);
  });

  it('writes warnings and errors to stderr', () => {
    logger.warn('Careful');
    logger.error('Broken');

    assert.equal(stdout.mock.callCount(), 0);
    assert.equal(stderr.mock.callCount(), 2);
  });

  it('appends the stack of an error instead of serialising it', () => {
    const error = new Error('boom');
    logger.error('Request failed', { status: 500, error });

    const [line] = stderr.mock.calls[0].arguments;
    assert.ok(line.includes('Request failed {"status":500}\n'));
    assert.ok(line.endsWith(error.stack));
  });

  it('skips entries below the configured level', () => {
    config.logLevel = 'warn';
    logger.debug('hidden');
    logger.info('hidden');
    logger.warn('shown');

    assert.equal(stdout.mock.callCount(), 0);
    assert.equal(stderr.mock.callCount(), 1);
  });

  it('writes nothing when silent', () => {
    config.logLevel = 'silent';
    logger.error('hidden');

    assert.equal(stderr.mock.callCount(), 0);
  });
});
