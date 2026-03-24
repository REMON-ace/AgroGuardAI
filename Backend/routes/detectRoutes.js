// ============================================================
// routes/detectRoutes.js
// ============================================================

const express       = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload         = require('../middleware/upload');
const { detectDisease } = require('../controllers/detectController');

const router = express.Router();

// POST /api/detect  (requires login + image upload)
router.post('/', authMiddleware, upload.single('image'), detectDisease);

module.exports = router;
