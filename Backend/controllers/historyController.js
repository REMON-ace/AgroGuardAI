// ============================================================
// controllers/historyController.js - Detection History
// ============================================================

const Detection = require('../models/detectionModel');

// ── GET /api/history - Get logged-in user's scan history ─────
const getHistory = async (req, res, next) => {
  try {
    const userId     = req.user.id;
    const detections = await Detection.findByUserId(userId);

    res.status(200).json({
      success: true,
      count:   detections.length,
      history: detections,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/history/:id - Get a single detection ────────────
const getSingleDetection = async (req, res, next) => {
  try {
    const { id }    = req.params;
    const userId    = req.user.id;
    const detection = await Detection.findById(id);

    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection not found.' });
    }

    // Users can only view their own detections
    if (detection.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, detection });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, getSingleDetection };
