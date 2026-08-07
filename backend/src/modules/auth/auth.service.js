import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma.js";
import { sendMail } from "../../lib/mailer.js";
import { generateToken, hashToken } from "../../utils/tokens.js";
import {
  signToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import {
  validateRegister,
  validateLogin,
  validateEmail,
  validateResetPassword,
  validateRefreshToken,
} from "./auth.validation.js";

const googleClient = new OAuth2Client(env.googleClientId);

const VERIFICATION_EXPIRY_MS = 1000 * 60 * 60 * 24;
const RESET_EXPIRY_MS = 1000 * 60 * 30;
const REFRESH_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const isDevelopment = process.env.NODE_ENV !== "production";
const skipEmail = process.env.SKIP_EMAIL === "true";

export async function register({ firstName, lastName, email, password }) {
  validateRegister({ firstName, lastName, email, password });

  const existing = await prisma.student.findUnique({ where: { email } });

  if (existing) {
    // If student exists but email NOT verified, allow resending verification
    if (!existing.emailVerified) {
      // Generate new verification token
      const { rawToken, tokenHash } = generateToken();
      const verifyUrl = `${env.frontendUrl}/verify-email?token=${rawToken}`;

      // Update verification token and expiry
      await prisma.student.update({
        where: { id: existing.id },
        data: {
          verificationToken: tokenHash,
          verificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
        },
      });

      // Try to send verification email
      try {
        await sendMail({
          to: email,
          subject: "Verify your StudAI account",
          html: `<p>Hi ${existing.firstName},</p><p>Click below to verify your account:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
        // In development or with SKIP_EMAIL, this is expected
        if (!isDevelopment && !skipEmail) {
          throw new AppError("Unable to send verification email. Please try again or contact support", 500);
        }
      }

      return {
        id: existing.id,
        email: existing.email,
      };
    }

    // Email already verified - user should login instead
    throw new AppError("This email is already registered. Please log in to continue", 409);
  }

  // New registration - use transaction for atomicity
  const passwordHash = await bcrypt.hash(password, 10);
  const { rawToken, tokenHash } = generateToken();
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${rawToken}`;

  let student;
  let emailSent = false;

  try {
    // First, try to send email (to avoid creating account if email will fail in production)
    if (!isDevelopment && !skipEmail) {
      await sendMail({
        to: email,
        subject: "Verify your StudAI account",
        html: `<p>Hi ${firstName},</p><p>Click below to verify your account:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
      });
      emailSent = true;
    }

    // Create student account (only after email is sent in production)
    student = await prisma.student.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        verificationToken: tokenHash,
        verificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
      },
    });

    // In development or skip mode, try sending email after creating account
    if ((isDevelopment || skipEmail) && !emailSent) {
      try {
        await sendMail({
          to: email,
          subject: "Verify your StudAI account",
          html: `<p>Hi ${firstName},</p><p>Click below to verify your account:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
        // In development, this is fine - link is logged to console
      }
    }

    return { id: student.id, email: student.email };
  } catch (error) {
    // If student was created but email failed, clean up
    if (student && !emailSent && !isDevelopment && !skipEmail) {
      await prisma.student.delete({ where: { id: student.id } });
      throw new AppError("Unable to send verification email. Please try again or contact support", 500);
    }

    // If it's our custom error, rethrow it
    if (error instanceof AppError) {
      throw error;
    }

    // Log and throw generic error
    console.error("Registration error:", error);
    throw new AppError("Unable to create account. Please try again", 500);
  }
}

export async function verifyEmail(rawToken) {
  const tokenHash = hashToken(rawToken);
  const student = await prisma.student.findFirst({
    where: {
      verificationToken: tokenHash,
      verificationTokenExpiresAt: { gt: new Date() },
    },
    include: {
      profile: true, // Include profile to check if onboarding is complete
    },
  });
  if (!student)
    throw new AppError("Verification link is invalid or has expired. Please request a new one", 400);

  // Generate tokens for automatic login
  const accessToken = signToken({ studentId: student.id });
  const refreshToken = signRefreshToken({ studentId: student.id });
  const refreshTokenHash = hashToken(refreshToken);

  // Update student: verify email, clear verification token, set refresh token
  await prisma.student.update({
    where: { id: student.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
      refreshToken: refreshTokenHash,
      refreshTokenExpiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
  });

  // Return tokens and user info, plus onboarding status
  return {
    accessToken,
    refreshToken,
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    },
    hasProfile: !!student.profile, // true if onboarding complete, false otherwise
  };
}

export async function login({ email, password }) {
  validateLogin({ email, password });

  const student = await prisma.student.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      profile: true, // Include profile to check if onboarding is complete
    },
  });
  if (!student || !student.passwordHash)
    throw new AppError("Email or password is incorrect. Please try again", 401);

  const valid = await bcrypt.compare(password, student.passwordHash);
  if (!valid) throw new AppError("Email or password is incorrect. Please try again", 401);

  if (!student.emailVerified)
    throw new AppError("Please verify your email before logging in. Check your inbox for the verification link", 403);

  const accessToken = signToken({ studentId: student.id });
  const refreshToken = signRefreshToken({ studentId: student.id });
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      refreshToken: refreshTokenHash,
      refreshTokenExpiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
  });

  return {
    accessToken,
    refreshToken, // Return refreshToken to be set as cookie
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
    hasProfile: !!student.profile, // true if onboarding complete, false otherwise
  };
}

export async function forgotPassword(email) {
  validateEmail(email);

  const student = await prisma.student.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
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
  try {
    await sendMail({
      to: email,
      subject: "Reset your StudAI password",
      html: `<p>Click below to reset your password. This link expires in 30 minutes.</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError.message);
    if (!isDevelopment && !skipEmail) {
      throw new AppError("Unable to send password reset email. Please try again or contact support", 500);
    }
  }
}

export async function resetPassword({ rawToken, newPassword }) {
  validateResetPassword({ token: rawToken, newPassword });

  const tokenHash = hashToken(rawToken);
  const student = await prisma.student.findFirst({
    where: { resetToken: tokenHash, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!student) throw new AppError("Password reset link is invalid or has expired. Please request a new one", 400);

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
    include: {
      profile: true, // Include profile to check if onboarding is complete
    },
  });

  if (!student) {
    student = await prisma.student.findUnique({
      where: { email: payload.email },
      include: {
        profile: true,
      },
    });
    if (student) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: { googleId: payload.sub, emailVerified: true },
        include: {
          profile: true,
        },
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
        include: {
          profile: true,
        },
      });
    }
  }

  const accessToken = signToken({ studentId: student.id });
  const refreshToken = signRefreshToken({ studentId: student.id });
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      refreshToken: refreshTokenHash,
      refreshTokenExpiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
    hasProfile: !!student.profile, // Return onboarding status
  };
}

export async function refreshAccessToken(refreshToken) {
  validateRefreshToken(refreshToken);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Your session has expired. Please log in again", 401);
  }

  const refreshTokenHash = hashToken(refreshToken);
  const student = await prisma.student.findFirst({
    where: {
      id: payload.studentId,
      refreshToken: refreshTokenHash,
      refreshTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!student) throw new AppError("Your session has expired. Please log in again", 401);

  const newAccessToken = signToken({ studentId: student.id });
  const newRefreshToken = signRefreshToken({ studentId: student.id });
  const newRefreshTokenHash = hashToken(newRefreshToken);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      refreshToken: newRefreshTokenHash,
      refreshTokenExpiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(studentId) {
  await prisma.student.update({
    where: { id: studentId },
    data: {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    },
  });
}

export async function checkProfile(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: true,
    },
  });

  if (!student) {
    throw new AppError("Account not found. Please log in again", 404);
  }

  return {
    hasProfile: !!student.profile,
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
  };
}
