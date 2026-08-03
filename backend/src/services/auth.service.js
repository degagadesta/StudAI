import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mailer.js";
import { generateToken, hashToken } from "../utils/tokens.js";
import { signToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const googleClient = new OAuth2Client(env.googleClientId);

const VERIFICATION_EXPIRY_MS = 1000 * 60 * 60 * 24;
const RESET_EXPIRY_MS = 1000 * 60 * 30;

export async function register({ firstName, lastName, email, password }) {
  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const { rawToken, tokenHash } = generateToken();

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      verificationToken: tokenHash,
      verificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
    },
  });

  const verifyUrl = `${env.frontendUrl}/verify-email?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Verify your StudAI account",
    html: `<p>Hi ${firstName},</p><p>Click below to verify your account:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
  });

  return { id: student.id, email: student.email };
}

export async function verifyEmail(rawToken) {
  const tokenHash = hashToken(rawToken);
  const student = await prisma.student.findFirst({
    where: {
      verificationToken: tokenHash,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });
  if (!student)
    throw new AppError("Invalid or expired verification token", 400);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });
}

export async function login({ email, password }) {
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student || !student.passwordHash)
    throw new AppError("Invalid email or password", 401);

  const valid = await bcrypt.compare(password, student.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401);

  if (!student.emailVerified)
    throw new AppError("Please verify your email before logging in", 403);

  const token = signToken({ studentId: student.id });
  return {
    token,
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
  };
}

export async function forgotPassword(email) {
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student) return;

  const { rawToken, tokenHash } = generateToken();
  await prisma.student.update({
    where: { id: student.id },
    data: {
      resetToken: tokenHash,
      resetTokenExpiresAt: new Date(Date.now() + RESET_EXPIRY_MS),
    },
  });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Reset your StudAI password",
    html: `<p>Click below to reset your password. This link expires in 30 minutes.</p><a href="${resetUrl}">${resetUrl}</a>`,
  });
}

export async function resetPassword({ rawToken, newPassword }) {
  const tokenHash = hashToken(rawToken);
  const student = await prisma.student.findFirst({
    where: { resetToken: tokenHash, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!student) throw new AppError("Invalid or expired reset token", 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.student.update({
    where: { id: student.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
}

export async function googleSignIn(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();

  let student = await prisma.student.findUnique({
    where: { googleId: payload.sub },
  });

  if (!student) {
    student = await prisma.student.findUnique({
      where: { email: payload.email },
    });
    if (student) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: { googleId: payload.sub, emailVerified: true },
      });
    } else {
      student = await prisma.student.create({
        data: {
          firstName: payload.given_name || "Student",
          lastName: payload.family_name || "",
          email: payload.email,
          googleId: payload.sub,
          emailVerified: true,
        },
      });
    }
  }

  const token = signToken({ studentId: student.id });
  return {
    token,
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
  };
}
