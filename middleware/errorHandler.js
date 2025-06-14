class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 404;
      this.name = 'NotFoundError';
    }
  }
  
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 400;
      this.name = 'ValidationError';
    }
  }
  
  class AuthError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'AuthError';
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      error: {
        message,
        type: err.name
      }
    });
  };
  
  module.exports = { errorHandler, NotFoundError, ValidationError, AuthError };