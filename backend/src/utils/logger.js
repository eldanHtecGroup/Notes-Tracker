import config from '../config/index.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

// One line per entry: "<timestamp> <LEVEL> <message> <json meta>", with an error's stack on the following lines.
const format = (level, message, meta, error) => {
  let line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}`;
  if (Object.keys(meta).length) line += ` ${JSON.stringify(meta)}`;
  if (error?.stack) line += `\n${error.stack}`;
  return line;
};

const log = (level, message, { error, ...meta } = {}) => {
  if (LEVELS[level] < (LEVELS[config.logLevel] ?? LEVELS.info)) return;
  const output = LEVELS[level] >= LEVELS.warn ? console.error : console.log;
  output(format(level, message, meta, error));
};

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};

export default logger;
