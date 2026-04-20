// ============================================================
// routes/adminRoutes.js
// ============================================================

const express         = require('express');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAllUsers, deleteUser,
  getAllDetections, deleteDetection,
  getDashboardStats,
  getDetectionDetails, getAnalytics, exportLogs
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/export', exportLogs);

// Users
router.get('/users',           getAllUsers);
router.delete('/users/:id',    deleteUser);

// Detections
router.get('/detections',         getAllDetections);
router.delete('/detections/:id',  deleteDetection);
router.get('/log/:id',            getDetectionDetails);

module.exports = router;
