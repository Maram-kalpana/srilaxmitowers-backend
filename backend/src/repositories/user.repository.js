import { query, queryOne } from "../config/db.js";

const userRepository = {
  async findById(id) {
    return queryOne(
      `SELECT * FROM users WHERE id = :id AND deleted_at IS NULL`,
      { id }
    );
  },

  async findByUsername(username) {
    return queryOne(
      `SELECT * FROM users WHERE username = :username AND deleted_at IS NULL`,
      { username }
    );
  },

  async findByEmail(email) {
    return queryOne(
      `SELECT * FROM users WHERE email = :email AND deleted_at IS NULL`,
      { email }
    );
  },

  async create(data) {
    const result = await query(
      `INSERT INTO users (username, email, phone, password_hash, name, role, employee_ref_id)
       VALUES (:username, :email, :phone, :password_hash, :name, :role, :employee_ref_id)`,
      data
    );
    return this.findById(result.insertId);
  },

  async updatePassword(id, password_hash) {
    await query(`UPDATE users SET password_hash = :password_hash WHERE id = :id`, {
      id,
      password_hash,
    });
  },

  async saveRefreshToken(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (:userId, :tokenHash, :expiresAt)`,
      { userId, tokenHash, expiresAt }
    );
  },

  async findRefreshToken(tokenHash) {
    return queryOne(
      `SELECT * FROM refresh_tokens WHERE token_hash = :tokenHash AND revoked_at IS NULL AND expires_at > NOW()`,
      { tokenHash }
    );
  },

  async revokeRefreshToken(tokenHash) {
    await query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = :tokenHash`,
      { tokenHash }
    );
  },

  async revokeAllRefreshTokens(userId) {
    await query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :userId AND revoked_at IS NULL`,
      { userId }
    );
  },

  async saveResetToken(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (:userId, :tokenHash, :expiresAt)`,
      { userId, tokenHash, expiresAt }
    );
  },

  async findResetToken(tokenHash) {
    return queryOne(
      `SELECT * FROM password_reset_tokens WHERE token_hash = :tokenHash AND used_at IS NULL AND expires_at > NOW()`,
      { tokenHash }
    );
  },

  async markResetTokenUsed(id) {
    await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = :id`, { id });
  },

  async countActive() {
    const row = await queryOne(
      `SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL AND is_active = 1`
    );
    return row?.total ?? 0;
  },
};

export default userRepository;
