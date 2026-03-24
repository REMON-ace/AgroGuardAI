// ============================================================
// controllers/adminController.js - Admin Panel Operations
// ============================================================

const User      = require('../models/userModel');
const Detection = require('../models/detectionModel');

// ── GET /api/admin/users - All users ─────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/users/:id - Delete a user ──────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const result = await User.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/detections - All detections ───────────────
const getAllDetections = async (req, res, next) => {
  try {
    const detections = await Detection.getAll();
    res.status(200).json({ success: true, count: detections.length, detections });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/detections/:id - Delete a detection ────
const deleteDetection = async (req, res, next) => {
  try {
    const result = await Detection.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Detection not found.' });
    }

    res.status(200).json({ success: true, message: 'Detection deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, deleteUser, getAllDetections, deleteDetection };
