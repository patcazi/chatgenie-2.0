const express = require('express');
const Channel = require('../models/Channel'); // Import the Channel model

const router = express.Router();

// Create a channel
router.post('/create', async (req, res) => {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Channel name is required.' });
    }

    try {
        // Create the channel in the database
        const channel = await Channel.create({ name, description });
        res.json({ message: 'Channel created successfully!', data: channel });
    } catch (err) {
        console.error('Error creating channel:', err);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// List all channels
router.get('/list', async (req, res) => {
    try {
        const channels = await Channel.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ message: 'Channels retrieved successfully!', data: channels });
    } catch (err) {
        console.error('Error retrieving channels:', err);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

module.exports = router;
