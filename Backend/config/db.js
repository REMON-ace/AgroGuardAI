// ============================================================
// config/db.js - MySQL Database Connection Pool
// ============================================================

const mysql = require('mysql2');

// Create a connection pool (more efficient than single connection)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'agroguard_db',
  waitForConnections: true,
  connectionLimit:    10,   // Max 10 simultaneous connections
  queueLimit:         0,
});

// Export promise-based pool for async/await usage
module.exports = pool.promise();
