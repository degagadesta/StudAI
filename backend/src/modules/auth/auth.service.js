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
import { startOrResumeSession } from "../activity/activity.service.js";
import { studentCache } from "../../lib/studentCache.js";
import { deletePDFFromStorage } from "../../lib/supabase.js";
import { invalidateAllStudent } from "../../utils/cacheInvalidation.js";

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

  // Cache student for fast subsequent auth checks
  studentCache.set(student.id);

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
    profile: student.profile, // Preloaded profile data
  };
}

export async function login({ email, password }) {
  validateLogin({ email, password });

  const student = await prisma.student.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      profile: {
        include: {
          curriculum: {
            include: {
              department: {
                include: {
                  university: true,
                },
              },
            },
          },
        },
      },
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

  // Cache student for fast subsequent auth checks
  studentCache.set(student.id);

  // Create or resume an activity session so daily hours tracking starts immediately
  const session = await startOrResumeSession(student.id);

  return {
    accessToken,
    refreshToken, // Return refreshToken to be set as cookie
    sessionId: session.sessionId, // Frontend uses this for heartbeat calls
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
    hasProfile: !!student.profile, // true if onboarding complete, false otherwise
    profile: student.profile, // Preloaded profile data (saves 1 API call)
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

  // Cache student for fast subsequent auth checks
  studentCache.set(student.id);

  // Create or resume an activity session — same as email/password login
  const session = await startOrResumeSession(student.id);

  return {
    accessToken,
    refreshToken,
    sessionId: session.sessionId,
    student: {
      id: student.id,
      firstName: student.firstName,
      email: student.email,
    },
    hasProfile: !!student.profile, // Return onboarding status
    profile: student.profile, // Preloaded profile data
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
  // Invalidate refresh token in database
  await prisma.student.update({
    where: { id: studentId },
    data: {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    },
  });

  // Invalidate student cache to force DB check on next request
  studentCache.delete(studentId);
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

/**
 * Delete user account permanently with cascade deletion
 */
export async function deleteAccount(studentId, password) {
  // Fetch student to verify existence and check if password is required
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      email: true,
      firstName: true,
      passwordHash: true,
      googleId: true,
    },
  });

  if (!student) {
    throw new AppError("Account not found", 404);
  }

  // If user has a password (not Google-only), require password verification
  if (student.passwordHash && !password) {
    throw new AppError("Password is required to delete your account", 400);
  }

  // Verify password if provided and user has password
  if (student.passwordHash && password) {
    const isPasswordValid = await bcrypt.compare(password, student.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Incorrect password. Please try again", 401);
    }
  }

  let supabasePaths = [];

  // Perform cascade deletion in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch all student course materials to clear their database records and Supabase objects
      const studentMaterials = await tx.courseMaterial.findMany({
        where: { uploadedBy: studentId },
        select: { id: true, storagePath: true },
      });
      const studentMaterialIds = studentMaterials.map((m) => m.id);
      supabasePaths = studentMaterials.map((m) => m.storagePath).filter(Boolean);

      // 2. Delete dependent records of course materials first
      if (studentMaterialIds.length > 0) {
        // Delete flashcard reviews for student's materials
        await tx.flashcardReview.deleteMany({
          where: {
            flashcard: {
              materialId: { in: studentMaterialIds }
            }
          }
        });

        // Delete flashcards
        await tx.flashcard.deleteMany({
          where: {
            materialId: { in: studentMaterialIds }
          }
        });

        // Delete chunks/embeddings
        await tx.materialChunk.deleteMany({
          where: {
            materialId: { in: studentMaterialIds }
          }
        });

        // Delete pdf highlights and notes for student's materials
        await tx.pdfHighlight.deleteMany({
          where: {
            materialId: { in: studentMaterialIds }
          }
        });

        await tx.pdfNote.deleteMany({
          where: {
            materialId: { in: studentMaterialIds }
          }
        });

        // Delete quiz attempts for student's quizzes
        await tx.quizAttempt.deleteMany({
          where: {
            quiz: {
              materialId: { in: studentMaterialIds }
            }
          }
        });

        // Delete quizzes
        await tx.quiz.deleteMany({
          where: {
            materialId: { in: studentMaterialIds }
          }
        });

        // Delete the course materials
        await tx.courseMaterial.deleteMany({
          where: {
            id: { in: studentMaterialIds }
          }
        });
      }

      // 3. Delete student activity and usage logs
      await tx.activityLog.deleteMany({
        where: { studentId },
      });

      await tx.usageLog.deleteMany({
        where: { studentId },
      });

      // Delete active activity sessions
      await tx.activitySession.deleteMany({
        where: { studentId },
      });

      // 4. Delete upcoming events
      await tx.upcomingEvent.deleteMany({
        where: { studentId },
      });

      // 5. Delete weak topics
      await tx.weakTopic.deleteMany({
        where: { studentId },
      });

      // 6. Delete flashcard reviews directly completed by the student
      await tx.flashcardReview.deleteMany({
        where: { studentId },
      });

      // 7. Delete quiz attempts directly completed by the student
      await tx.quizAttempt.deleteMany({
        where: { studentId },
      });

      // 8. Delete exam attempts directly completed by the student
      await tx.examAttempt.deleteMany({
        where: { studentId },
      });

      // 9. Delete pdf highlights and notes created by the student on other shared materials
      await tx.pdfHighlight.deleteMany({
        where: { studentId },
      });

      await tx.pdfNote.deleteMany({
        where: { studentId },
      });

      // 10. Delete chat messages
      await tx.chatMessage.deleteMany({
        where: {
          session: {
            studentId,
          },
        },
      });

      // Delete chat sessions
      await tx.chatSession.deleteMany({
        where: { studentId },
      });

      // 11. Delete notes
      await tx.note.deleteMany({
        where: { studentId },
      });

      // 12. Delete student course selections (if profile exists)
      const profile = await tx.studentProfile.findUnique({
        where: { studentId },
        select: { id: true },
      });

      if (profile) {
        await tx.studentCourseSelection.deleteMany({
          where: { studentProfileId: profile.id },
        });

        // Delete student profile
        await tx.studentProfile.delete({
          where: { id: profile.id },
        });
      }

      // 13. Finally, delete the student record
      await tx.student.delete({
        where: { id: studentId },
      });
    }, { timeout: 15000 })

    // Clean up Supabase storage files asynchronously after transaction completes
    if (supabasePaths.length > 0) {
      console.log(`[Auth Cleanup] Deleting ${supabasePaths.length} student files from Supabase...`);
      Promise.all(
        supabasePaths.map((path) =>
          deletePDFFromStorage(path).catch((err) =>
            console.error(`[Auth Cleanup] Failed to delete file ${path}:`, err.message)
          )
        )
      ).catch((err) => console.error("[Auth Cleanup] Supabase batch deletion error:", err.message));
    }

    // Invalidate in-memory session cache immediately
    studentCache.delete(studentId);

    // Invalidate Redis caches immediately
    await invalidateAllStudent(studentId).catch((err) => {
      console.error("[Auth Cleanup] Redis cache invalidation error:", err.message);
    });

    // Optional: Send goodbye email (outside transaction to avoid rollback if email fails)
    try {
      if (!isDevelopment || !skipEmail) {
        await sendMail({
          to: student.email,
          subject: "Your StudAI account has been deleted",
          html: `<p>Hi ${student.firstName},</p><p>Your StudAI account has been permanently deleted as requested.</p><p>We're sorry to see you go. If you have any feedback or change your mind, feel free to create a new account anytime.</p><p>Best regards,<br>The StudAI Team</p>`,
        });
      }
    } catch (emailError) {
      // Don't throw error if email fails - account is already deleted
      console.error("Failed to send account deletion confirmation email:", emailError.message);
    }

    return {
      success: true,
      email: student.email,
    };
  } catch (error) {
    // If it's our custom error, rethrow it
    if (error instanceof AppError) {
      throw error;
    }

    // Log the error for debugging
    console.error("Account deletion error:", error);
    throw new AppError("Unable to delete account. Please try again or contact support", 500);
  }
}
