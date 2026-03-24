// ============================================================
// routes/historyRoutes.js
// ============================================================

const express        = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getHistory, getSingleDetection } = require('../controllers/historyController');

const router = express.Router();

// GET /api/history         – all scans for logged-in user
router.get('/', authMiddleware, getHistory);

// GET /api/history/:id     – single scan detail
router.get('/:id', authMiddleware, getSingleDetection);

module.exports = router;
