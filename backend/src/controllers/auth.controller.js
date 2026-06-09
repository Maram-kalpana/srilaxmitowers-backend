import authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return sendSuccess(res, "Registered successfully", {
    user: result.user,
    accessToken: result.accessToken,
  }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return sendSuccess(res, "Logged in successfully", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(token);
  res.clearCookie("refreshToken");
  return sendSuccess(res, "Logged out successfully");
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const result = await authService.refresh(token);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return sendSuccess(res, "Token refreshed", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  return sendSuccess(res, "Profile fetched", { user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return sendSuccess(res, result.message, { resetToken: result.resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, "Password reset successfully");
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return sendSuccess(res, "Password changed successfully");
});
