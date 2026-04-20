// ============================================================
// middleware/adminMiddleware.js - Admin Role Verification
// ============================================================

/**
 * Protect admin routes - verify user role is 'admin'.
 * Usage: add `adminMiddleware` AFTER `authMiddleware`.
 */
const adminMiddleware = (req, res, next) => {
  // req.user is set by authMiddleware (decoded from JWT)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin only.' });
  }
  next();
};

module.exports = adminMiddleware;
