import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';

const defaultLogLevels = { development: 'debug', production: 'info', test: 'silent' };

const config = {
  env,
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || defaultLogLevels[env] || 'info',
};

export default config;
