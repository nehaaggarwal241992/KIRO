/**
 * Global error handler middleware for the Review System
 * Catches all exceptions and returns consistent error responses
 */

class AppError extends Error {
  constructor(message, statusCode, code = null, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  const context = {
    userId: req.user?.id || 'anonymous',
    action: `${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  };

  console.error('Error occurred:', {
    error: {
      message: error.message,
      stack: err.stack,
      statusCode: error.statusCode
    },
    context
  });

  // Default error values
  let statusCode = error.statusCode || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Internal server error';
  let field = error.field || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    code = 'CONSTRAINT_VIOLATION';
    message = 'Database constraint violation';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503;
    code = 'DATABASE_BUSY';
    message = 'Database is temporarily unavailable';
  } else if (err.message && err.message.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
    statusCode = 400;
    code = 'INVALID_REFERENCE';
    message = 'Referenced resource does not exist';
  }

  // Handle authentication errors
  if (err.name === 'UnauthorizedError' || message.includes('unauthorized')) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Authentication required';
  }

  // Handle authorization errors
  if (err.name === 'ForbiddenError' || message.includes('forbidden')) {
    statusCode = 403;
    code = 'FORBIDDEN';
    message = 'Insufficient permissions';
  }

  // Handle not found errors
  if (err.name === 'NotFoundError' || message.includes('not found')) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Resource not found';
  }

  // Send error response
  const errorResponse = {
    error: {
      code,
      message,
      ...(field && { field })
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Helper function to create operational errors
const createError = (message, statusCode, code = null, field = null) => {
  return new AppError(message, statusCode, code, field);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  errorHandler,
  AppError,
  createError,
  asyncHandler
};