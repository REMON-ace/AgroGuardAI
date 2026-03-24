// ============================================================
// server.js - AgroGuard AI Backend Entry Point
// ============================================================

require('dotenv').config(); // Load environment variables first

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const db           = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports ────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const detectRoutes    = require('./routes/detectRoutes');
const plantCareRoutes = require('./routes/plantCareRoutes');
const historyRoutes   = require('./routes/historyRoutes');
const profileRoutes   = require('./routes/profileRoutes');
const adminRoutes     = require('./routes/adminRoutes');

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());                        // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev'));                          // HTTP request logger

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Test DB connection on startup ────────────────────────────
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ MySQL connected successfully');
    connection.release();
  }
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/detect',     detectRoutes);
app.use('/api/plant-care', plantCareRoutes);
app.use('/api/history',    historyRoutes);
app.use('/api/profile',    profileRoutes);
app.use('/api/admin',      adminRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🌿 AgroGuard AI Backend is running!', status: 'OK' });
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
