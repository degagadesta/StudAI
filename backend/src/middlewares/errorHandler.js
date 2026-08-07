export function errorHandler(err, req, res, next) {
  // Network and timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: "Unable to connect to the server. Please check your internet connection and try again"
    });
  }

  if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
    return res.status(503).json({
      error: "Connection was interrupted. Please try again"
    });
  }

  // Database connection errors
  if (err.code === 'P2024' || err.code === 'P1001' || err.message?.includes('timed out')) {
    return res.status(503).json({
      error: "Service temporarily unavailable. Please try again in a moment"
    });
  }

  // Prisma specific errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: "This record already exists. Please use different information"
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: "The requested item was not found"
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: "File is too large. Maximum size is 20MB"
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: "Unexpected file upload. Please upload only one PDF file"
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: "Invalid session. Please log in again"
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: "Your session has expired. Please log in again"
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message || "Please check your input and try again"
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong. Please try again";

  // Only log unexpected errors (not operational errors)
  if (!err.isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({ error: message });
}
