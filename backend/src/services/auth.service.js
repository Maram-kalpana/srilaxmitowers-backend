import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
  generateResetToken,
} from "../utils/tokens.js";
import { mapUser } from "../utils/mappers.js";

const SALT_ROUNDS = 12;

function buildTokens(user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

const authService = {
  async register({ name, email, phone, password, role = "user" }) {
    const username = (email || name).toLowerCase().replace(/\s+/g, "").slice(0, 32);
    const existing = await userRepository.findByUsername(username);
    if (existing) throw ApiError.conflict("User already exists");

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      username,
      email: email || null,
      phone: phone || null,
      password_hash,
      name,
      role: role || "user",
      employee_ref_id: null,
    });

    const tokens = buildTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, hashToken(tokens.refreshToken), expiresAt);

    return { user: mapUser(user), ...tokens };
  },

  async login({ login, password }) {
    const identifier = login.trim().toLowerCase();
    let user = await userRepository.findByUsername(identifier);
    if (!user && identifier.includes("@")) {
      user = await userRepository.findByEmail(identifier);
    }
    if (!user) throw ApiError.unauthorized("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized("Invalid credentials");

    const tokens = buildTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, hashToken(tokens.refreshToken), expiresAt);

    return { user: mapUser(user), ...tokens };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await userRepository.revokeRefreshToken(hashToken(refreshToken));
    }
    return true;
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized("Refresh token required");
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await userRepository.findRefreshToken(hashToken(refreshToken));
    if (!stored) throw ApiError.unauthorized("Invalid refresh token");

    const user = await userRepository.findById(decoded.sub);
    if (!user) throw ApiError.unauthorized("User not found");

    await userRepository.revokeRefreshToken(hashToken(refreshToken));
    const tokens = buildTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, hashToken(tokens.refreshToken), expiresAt);

    return { user: mapUser(user), ...tokens };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return mapUser(user);
  },

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { message: "If the email exists, a reset link was sent" };

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await userRepository.saveResetToken(user.id, hashToken(token), expiresAt);

    return {
      message: "If the email exists, a reset link was sent",
      resetToken: process.env.NODE_ENV === "development" ? token : undefined,
    };
  },

  async resetPassword({ token, password }) {
    const stored = await userRepository.findResetToken(hashToken(token));
    if (!stored) throw ApiError.badRequest("Invalid or expired reset token");

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.updatePassword(stored.user_id, password_hash);
    await userRepository.markResetTokenUsed(stored.id);
    await userRepository.revokeAllRefreshTokens(stored.user_id);
    return true;
  },

  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) throw ApiError.badRequest("Current password is incorrect");

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, password_hash);
    await userRepository.revokeAllRefreshTokens(userId);
    return true;
  },
};

export default authService;
