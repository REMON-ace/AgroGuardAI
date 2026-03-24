// ============================================================
// middleware/authMiddleware.js - JWT Token Verification
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * Protect routes - verify JWT token from Authorization header
 * Usage: add `authMiddleware` to any route that needs login
 */
const authMiddleware = (req, res, next) => {
  // Token format: "Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, email) to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
