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

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        console.log('Received token:', token); // Debug log
        const decoded = jwt.verify(token, 'your-secret-key');
        console.log('Decoded token:', decoded); // Debug log
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', authenticateToken, messageRoutes); // Use the messaging route
app.use('/api/channels', authenticateToken, channelRoutes); // Use the channels route

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to ChatGenie 2.0 Backend!');
});

module.exports = app;


