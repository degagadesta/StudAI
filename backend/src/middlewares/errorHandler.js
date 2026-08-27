export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong";
  if (!err.isOperational) console.error(err); // only log real bugs, not expected errors
  res.status(statusCode).json({ error: message });
}
