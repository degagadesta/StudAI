import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

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
  await authService.verifyEmail(req.query.token);
  res.json({ message: "Email verified successfully." });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production, false in dev
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
  });

  // Send only accessToken in response body
  res.status(200).json({
    accessToken: result.accessToken,
    student: result.student
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
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  // Send only accessToken in response body
  res.status(200).json({
    accessToken: result.accessToken,
    student: result.student
  });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.json(result);
});

export const logoutHandler = asyncHandler(async (req, res) => {
  await authService.logout(req.studentId);
  res.json({ message: "Logged out successfully" });
});
