// ============================================================
// controllers/plantCareController.js - Plant Care Info API
// ============================================================

const PlantCare = require('../models/plantCareModel');

// ── GET /api/plant-care?disease=early_blight ─────────────────
const getPlantCare = (req, res) => {
  const { disease } = req.query;

  if (!disease) {
    // Return all available disease names
    const diseases = PlantCare.getAllDiseases();
    return res.status(200).json({
      success: true,
      message: 'Available diseases in the database',
      diseases,
    });
  }

  const careInfo = PlantCare.getByDisease(disease);

  if (!careInfo) {
    return res.status(404).json({
      success: false,
      message: `No care information found for "${disease}". Try another disease name.`,
      tip: 'Use GET /api/plant-care (without params) to see all available diseases.',
    });
  }

  res.status(200).json({
    success: true,
    data: careInfo,
  });
};

module.exports = { getPlantCare };
