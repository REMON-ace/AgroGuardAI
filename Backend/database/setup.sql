-- ============================================================
-- database/setup.sql - AgroGuard AI Database Schema
-- ============================================================
-- Run this file to create your database and tables.
--
-- HOW TO RUN:
--   mysql -u root -p < database/setup.sql
-- OR paste into MySQL Workbench / phpMyAdmin
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS agroguard_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agroguard_db;

-- ── Table: users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash
  role       ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
);

-- ── Table: detections ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detections (
  id           INT           NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL,
  image_path   VARCHAR(255)  NOT NULL,          -- relative path: /uploads/filename.jpg
  disease_name VARCHAR(100)  NOT NULL,
  confidence   DECIMAL(5,2)  DEFAULT 0.00,      -- e.g. 87.50 (percent)
  remedy       TEXT,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Sample admin user (password: admin123) ───────────────────
-- (bcrypt hash of "admin123" with 10 salt rounds)
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@agroguard.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihC',
  'admin'
);

-- ── Verify tables created ─────────────────────────────────────
SHOW TABLES;
