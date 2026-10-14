class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'Bad Request', details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

export default ApiError;
