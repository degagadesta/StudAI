import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }
  try {
    const payload = verifyToken(header.split(" ")[1]);
    req.studentId = payload.studentId;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
