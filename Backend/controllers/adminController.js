// ============================================================
// controllers/adminController.js - Admin Panel Operations
// ============================================================

const User      = require('../models/userModel');
const Detection = require('../models/detectionModel');
const db        = require('../config/db');

// ── GET /api/admin/users - All users ─────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/users/:id - Delete a user ──────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const result = await User.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/detections - All detections ───────────────
const getAllDetections = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM detections';
    const params = [];
    const conditions = [];

    if (req.query.disease) {
      conditions.push('disease_name LIKE ?');
      params.push(`%${req.query.disease}%`);
    }
    if (req.query.date) {
      conditions.push('DATE(created_at) = ?');
      params.push(req.query.date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const [detections] = await db.execute(query, params);
    res.status(200).json({ success: true, count: detections.length, detections });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/detections/:id - Delete a detection ────
const deleteDetection = async (req, res, next) => {
  try {
    const result = await Detection.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Detection not found.' });
    }

    res.status(200).json({ success: true, message: 'Detection deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/dashboard-stats - Overview stats ──────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalDetections }]] = await db.execute('SELECT COUNT(*) as totalDetections FROM detections');
    const [freqDisease] = await db.execute('SELECT disease_name, COUNT(*) as count FROM detections GROUP BY disease_name ORDER BY count DESC LIMIT 1');
    const [[{ todayDetections }]] = await db.execute('SELECT COUNT(*) as todayDetections FROM detections WHERE DATE(created_at) = CURDATE()');

    res.status(200).json({ 
      success: true, 
      stats: {
        totalUsers,
        totalDetections,
        frequentDisease: freqDisease.length > 0 ? freqDisease[0].disease_name : 'N/A',
        todayDetections
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/log/:id - Detection Details ───────────────
const getDetectionDetails = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, u.name as user_name, u.email as user_email 
      FROM detections d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Log not found' });
    res.status(200).json({ success: true, detection: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/analytics - Chart Data ────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const [topDiseases] = await db.execute('SELECT disease_name, COUNT(*) as count FROM detections GROUP BY disease_name ORDER BY count DESC LIMIT 5');
    const [dailyCounts] = await db.execute('SELECT DATE(created_at) as date, COUNT(*) as count FROM detections GROUP BY DATE(created_at) ORDER BY date ASC');
    
    res.status(200).json({ success: true, topDiseases, dailyCounts });
  } catch(err) {
    next(err);
  }
};

// ── GET /api/admin/export - Export CSV ───────────────────────
const exportLogs = async (req, res, next) => {
  try {
    const [detections] = await db.execute('SELECT id, user_id, disease_name, confidence, created_at FROM detections ORDER BY created_at DESC');
    let csv = 'ID,User ID,Disease Name,Confidence,Date\\n';
    detections.forEach(d => {
      const disease = d.disease_name.replace(/,/g, '');
      csv += `${d.id},${d.user_id},${disease},${d.confidence},${d.created_at}\\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('detection_logs.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getAllUsers, deleteUser, 
  getAllDetections, deleteDetection, 
  getDashboardStats, getDetectionDetails, getAnalytics, exportLogs 
};
