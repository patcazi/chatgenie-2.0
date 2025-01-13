const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages'); // Import the messaging route
const channelRoutes = require('./routes/channels'); // Import the channels route

// Initialize environment variables
dotenv.config();

// Initialize app
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://3.145.42.181:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/channels', authenticateToken, channelRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to ChatGenie 2.0 Backend!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'An internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;

