// ============================================================
// middleware/errorHandler.js - Global Error Handler
// ============================================================

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' });
  }

  // Multer file type error (custom)
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ success: false, message: 'Only image files are allowed (jpg, jpeg, png, webp).' });
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal server error.';

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
