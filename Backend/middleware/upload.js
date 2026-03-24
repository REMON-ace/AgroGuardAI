// ============================================================
// middleware/upload.js - Multer File Upload Configuration
// ============================================================

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Ensure uploads folder exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Storage engine ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to /uploads folder
  },
  filename: (req, file, cb) => {
    // Unique filename: userId_timestamp.ext
    const userId = req.user ? req.user.id : 'guest';
    const ext    = path.extname(file.originalname).toLowerCase();
    const name   = `user${userId}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

// ── File type filter ─────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
               && allowedTypes.test(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};

// ── Multer config ────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
