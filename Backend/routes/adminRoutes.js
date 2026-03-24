// ============================================================
// routes/adminRoutes.js
// NOTE: In production, add an isAdmin middleware check here.
// For now, any logged-in user can access (add role column later).
// ============================================================

const express        = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllUsers, deleteUser,
  getAllDetections, deleteDetection,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Users
router.get('/users',           getAllUsers);
router.delete('/users/:id',    deleteUser);

// Detections
router.get('/detections',         getAllDetections);
router.delete('/detections/:id',  deleteDetection);

module.exports = router;
