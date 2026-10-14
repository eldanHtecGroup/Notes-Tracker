import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err });
  server.close(() => process.exit(1));
});
