import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }

  // Step 1: verify JWT signature + expiry
  let payload;
  try {
    payload = verifyToken(header.split(" ")[1]);
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  // Step 2: guard against crafted tokens that omit studentId
  if (!payload.studentId) {
    return next(new AppError("Invalid token payload", 401));
  }

  // Step 3: confirm the account still exists in the database
  // (handles deleted accounts — a valid JWT is not enough on its own)
  try {
    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
      select: { id: true },
    });

    if (!student) {
      return next(new AppError("Account no longer exists", 401));
    }
  } catch {
    return next(new AppError("Authentication check failed", 500));
  }

  req.studentId = payload.studentId;
  next();
}
