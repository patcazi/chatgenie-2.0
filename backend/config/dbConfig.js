import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default sequelize;