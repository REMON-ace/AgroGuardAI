// ============================================================
// routes/profileRoutes.js
// ============================================================

const express        = require('express');
const { body }       = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

const router = express.Router();

// GET  /api/profile               – fetch profile
router.get('/', authMiddleware, getProfile);

// PUT  /api/profile               – update name/email
router.put('/', authMiddleware, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
], updateProfile);

// PUT  /api/profile/change-password
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
