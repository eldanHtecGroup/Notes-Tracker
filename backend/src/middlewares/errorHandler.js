import config from '../config/index.js';

// Express identifies error middleware by its 4-argument signature, so `next` must stay.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;
  if (isServerError) console.error(err);

  res.status(statusCode).json({
    error: {
      message: isServerError && config.env === 'production' ? 'Internal Server Error' : err.message,
      ...(err.details && { details: err.details }),
      ...(isServerError && config.env === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
