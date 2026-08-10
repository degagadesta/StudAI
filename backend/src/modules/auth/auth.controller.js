import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as activityService from "../activity/activity.service.js";

export const registerHandler = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res
    .status(201)
    .json({
      message: "Registered. Check your email to verify your account.",
      student: result,
    });
});

export const verifyEmailHandler = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.query.token);

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Return access token, student info, and onboarding status
  res.json({
    message: "Email verified successfully.",
    accessToken: result.accessToken,
    student: result.student,
    hasProfile: result.hasProfile,
  });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Send accessToken, student info, AND hasProfile status
  res.status(200).json({
    accessToken: result.accessToken,
    student: result.student,
    hasProfile: result.hasProfile, // Include onboarding status
  });
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  await authService.resetPassword({
    rawToken: req.body.token,
    newPassword: req.body.newPassword,
  });
  res.json({ message: "Password reset successfully." });
});

export const googleSignInHandler = asyncHandler(async (req, res) => {
  const result = await authService.googleSignIn(req.body.idToken);

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Send accessToken, student info, AND hasProfile status
  res.status(200).json({
    accessToken: result.accessToken,
    student: result.student,
    hasProfile: result.hasProfile, // Include onboarding status
  });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  // Get refresh token from cookie instead of body
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token not found" });
  }

  const result = await authService.refreshAccessToken(refreshToken);

  // Set new refresh token as httpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Send only new accessToken in response body
  res.status(200).json({
    accessToken: result.accessToken,
  });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  // Close any active session
  try {
    const activeSession = await activityService.getActiveSession(req.studentId);
    if (activeSession) {
      await activityService.closeSession(activeSession.sessionId);
    }
  } catch (err) {
    console.error("Error closing session on logout:", err.message);
    // Don't fail logout if session close fails
  }

  await authService.logout(req.studentId);

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.json({ message: "Logged out successfully" });
});

export const checkProfileHandler = asyncHandler(async (req, res) => {
  const result = await authService.checkProfile(req.studentId);
  res.json(result);
});

export const deleteAccountHandler = asyncHandler(async (req, res) => {
  const { password, confirmDelete } = req.body;

  // Validate deletion request
  const { validateAccountDeletion } = await import("./auth.validation.js");
  validateAccountDeletion({ password, confirmDelete });

  // Delete account
  await authService.deleteAccount(req.studentId, password);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Your account has been permanently deleted. We're sorry to see you go.",
  });
});
