const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all channels
router.get('/', async (req, res) => {
  try {
    const channels = await db.Channel.findAll();
    res.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Create a new channel
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }
    
    const channel = await db.Channel.create({ name });
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

module.exports = router;
