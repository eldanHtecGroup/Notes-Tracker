import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  const errors = schema(req.body ?? {});
  if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};

export default validate;
