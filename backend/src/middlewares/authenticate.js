import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";
import { studentCache } from "../lib/studentCache.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Please log in to continue", 401));
  }

  // Step 1: verify JWT signature + expiry
  let payload;
  try {
    payload = verifyToken(header.split(" ")[1]);
  } catch {
    return next(new AppError("Your session has expired. Please log in again", 401));
  }

  // Step 2: guard against crafted tokens that omit studentId
  if (!payload.studentId) {
    return next(new AppError("Invalid session. Please log in again", 401));
  }

  // Step 3: Check cache first before hitting database
  if (studentCache.has(payload.studentId)) {
    // Cache hit - skip database query for performance
    req.studentId = payload.studentId;
    return next();
  }

  // Step 4: Cache miss - confirm the account still exists in the database
  // (handles deleted accounts — a valid JWT is not enough on its own)
  try {
    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
      select: { id: true },
    });

    if (!student) {
      return next(new AppError("Account not found. Please log in again", 401));
    }

    // Cache the student for future requests (15 min TTL)
    studentCache.set(payload.studentId);
  } catch {
    return next(new AppError("Unable to verify your session. Please try again", 500));
  }

  req.studentId = payload.studentId;
  next();
}
