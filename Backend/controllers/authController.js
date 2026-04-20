// ============================================================
// controllers/authController.js - Register & Login Logic
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');

// ── Helper: generate JWT token ───────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ── Helper: format express-validator errors into readable text ─
const formatValidationErrors = (errors) => {
  return errors.array().map((e) => e.msg).join(' • ');
};

// ── POST /api/auth/register ──────────────────────────────────
const register = async (req, res, next) => {
  try {
    // express-validator field errors (name too short, invalid email, etc.)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: formatValidationErrors(errors),
        errors:  errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Missing fields (extra safety beyond express-validator)
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are all required.',
      });
    }

    // Email already taken
    const existingUser = await User.findByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in instead.',
      });
    }

    // Password too short (extra safety)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Hash and store
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId:  result.insertId,
    });

  } catch (err) {
    // MySQL duplicate entry (race condition safety net)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in instead.',
      });
    }
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: formatValidationErrors(errors),
        errors:  errors.array(),
      });
    }

    const { email, password, loginRole } = req.body;

    // Missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // No user found with that email
    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with that email address.',
      });
    }

    // Wrong password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    // Verify role if trying to login as admin
    if (loginRole === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not an admin',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
