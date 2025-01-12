// dbConfig.js
const { Sequelize } = require('sequelize');
const path = require('path');

// 1. Resolve the exact DB file path
const dbFilePath = path.resolve(__dirname, 'chatgenie.db');

// 2. Log the absolute path for clarity
console.log("DB Path:", dbFilePath);

// 3. Initialize Sequelize with SQLite, enabling logging
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbFilePath,
  logging: console.log, // Enable SQL logs
});

module.exports = sequelize;