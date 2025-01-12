const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const router = express.Router();
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const existingUser = await db.User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        const newUser = await db.User.create({ username, password });
        
        // Create JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'User registered successfully.',
            token,
            user: { id: newUser.id, username: newUser.username } 
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await db.User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = password === user.password; // TODO: Use bcrypt in production
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful!',
            token,
            user: { id: user.id, username: user.username } 
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

module.exports = router;

