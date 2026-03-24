// ============================================================
// models/detectionModel.js - Detection History DB Operations
// ============================================================

const db = require('../config/db');

const Detection = {

  // Save a new detection result
  create: async ({ user_id, image_path, disease_name, confidence, remedy }) => {
    const sql = `
      INSERT INTO detections (user_id, image_path, disease_name, confidence, remedy)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      user_id, image_path, disease_name, confidence, remedy
    ]);
    return result;
  },

  // Get all detections for a specific user
  findByUserId: async (user_id) => {
    const [rows] = await db.execute(
      `SELECT * FROM detections WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // Get a single detection by ID
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT * FROM detections WHERE id = ?`, [id]
    );
    return rows[0];
  },

  // Get all detections (admin)
  getAll: async () => {
    const sql = `
      SELECT d.*, u.name AS user_name, u.email
      FROM detections d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Delete a detection record
  delete: async (id) => {
    const [result] = await db.execute(`DELETE FROM detections WHERE id = ?`, [id]);
    return result;
  },
};

module.exports = Detection;
