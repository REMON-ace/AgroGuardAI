// ============================================================
// routes/plantCareRoutes.js
// ============================================================

const express        = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getPlantCare } = require('../controllers/plantCareController');

const router = express.Router();

// GET /api/plant-care?disease=early_blight
router.get('/', authMiddleware, getPlantCare);

module.exports = router;
