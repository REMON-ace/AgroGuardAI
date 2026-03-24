// ============================================================
// controllers/profileController.js - User Profile Management
// ============================================================

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');

// ── GET /api/profile - Fetch current user's profile ──────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/profile - Update user info ──────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email } = req.body;
    await User.update(req.user.id, { name, email });

    res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/profile/change-password ─────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    // Fetch full user (including password hash)
    const [rows] = await require('../config/db').execute(
      `SELECT * FROM users WHERE id = ?`, [req.user.id]
    );
    const user = rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hashed);

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
