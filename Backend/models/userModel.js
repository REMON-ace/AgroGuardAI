// ============================================================
// models/userModel.js - User Database Operations
// ============================================================

const db = require('../config/db');

const User = {

  // Create a new user
  create: async ({ name, email, password }) => {
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [name, email, password]);
    return result;
  },

  // Find user by email (used for login)
  findByEmail: async (email) => {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0]; // Returns undefined if not found
  },

  // Find user by ID (used for profile)
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT id, name, email, created_at FROM users WHERE id = ?`, [id]
    );
    return rows[0];
  },

  // Update user profile
  update: async (id, { name, email }) => {
    const [result] = await db.execute(
      `UPDATE users SET name = ?, email = ? WHERE id = ?`,
      [name, email, id]
    );
    return result;
  },

  // Update password
  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.execute(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    );
    return result;
  },

  // Get all users (admin)
  getAll: async () => {
    const [rows] = await db.execute(
      `SELECT id, name, email, created_at FROM users ORDER BY created_at DESC`
    );
    return rows;
  },

  // Delete user (admin)
  delete: async (id) => {
    const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result;
  },
};

module.exports = User;
