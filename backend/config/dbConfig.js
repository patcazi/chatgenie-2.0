// dbConfig.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Use environment variable for DB path, fallback to default if not set
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'chatgenie.db');

// Log the database path being used
console.log("DB Path:", dbPath);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV !== 'production', // Only log in non-production
});

module.exports = sequelize;