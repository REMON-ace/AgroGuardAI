// ============================================================
// controllers/detectController.js - Plant Disease Detection
// ============================================================

const path      = require('path');
const { spawn } = require('child_process'); // Run Python script
const Detection = require('../models/detectionModel');

// ── Helper: run Python ML prediction script ──────────────────
const runMLModel = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH  || 'python3';
    const scriptPath = process.env.ML_SCRIPT_PATH || './ml/predict.py';

    // Spawn Python process: python3 predict.py /path/to/image.jpg
    const process_ = spawn(pythonPath, [scriptPath, imagePath]);

    let output = '';
    let errorOutput = '';

    // Collect stdout from Python
    process_.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect stderr (Python errors/warnings)
    process_.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // On process exit
    process_.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', errorOutput);
        // Return a fallback response if ML model fails
        resolve({
          disease:    'Unknown',
          confidence: 0,
          remedy:     'Could not process image. Please try again with a clearer photo.',
        });
      } else {
        try {
          const result = JSON.parse(output.trim()); // Python outputs JSON
          resolve(result);
        } catch (e) {
          console.error('Failed to parse ML output:', output);
          resolve({
            disease:    'Unknown',
            confidence: 0,
            remedy:     'Model returned an unexpected response.',
          });
        }
      }
    });
  });
};

// ── POST /api/detect ─────────────────────────────────────────
const detectDisease = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const imagePath     = req.file.path;           // e.g. uploads/user1_123456.jpg
    const imageUrl      = `/uploads/${req.file.filename}`; // Public URL for frontend
    const userId        = req.user.id;

    console.log(`🔍 Running ML detection on: ${imagePath}`);

    // Run ML model (Python script)
    const prediction = await runMLModel(imagePath);

    // Save detection to database
    await Detection.create({
      user_id:      userId,
      image_path:   imageUrl,
      disease_name: prediction.disease    || 'Unknown',
      confidence:   prediction.confidence || 0,
      remedy:       prediction.remedy     || 'No remedy available.',
    });

    res.status(200).json({
      success: true,
      message: 'Detection complete!',
      result: {
        disease:    prediction.disease,
        confidence: prediction.confidence,
        remedy:     prediction.remedy,
        image_url:  imageUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { detectDisease };
