import express from 'express';
import { Op } from 'sequelize';
import db from '../models/index.js';
const router = express.Router();

// Import socket utilities
const socketUtils = require('../utils/socket.cjs');

// Get channel messages
router.get('/:channelId', async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const messages = await db.Message.findAll({
            where: {
                channelId: req.params.channelId,
                type: 'channel'
            },
            include: [
                { model: db.User, as: 'sender', attributes: ['username'] }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Get direct messages between users
router.get('/direct/:userId', async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const messages = await db.Message.findAll({
            where: {
                type: 'direct',
                [Op.or]: [
                    { senderId: req.user.userId, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: req.user.userId }
                ]
            },
            include: [
                { model: db.User, as: 'sender', attributes: ['username'] }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching direct messages:', error);
        res.status(500).json({ message: 'Error fetching direct messages' });
    }
});

// Send a channel message
router.post('/', async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const { content, channelId } = req.body;
        const message = await db.Message.create({
            content,
            channelId,
            type: 'channel',
            senderId: req.user.userId
        });

        const messageWithUser = await db.Message.findOne({
            where: { id: message.id },
            include: [
                { model: db.User, as: 'sender', attributes: ['username'] }
            ]
        });

        // Emit the complete message object
        const io = socketUtils.getIO();
        io.emit('message', messageWithUser);
        
        res.status(201).json(messageWithUser);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Error creating message' });
    }
});

// Send a direct message
router.post('/direct', async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const { content, receiverId } = req.body;
        const message = await db.Message.create({
            content,
            senderId: req.user.userId,
            receiverId,
            type: 'direct'
        });

        const messageWithUser = await db.Message.findOne({
            where: { id: message.id },
            include: [
                { model: db.User, as: 'sender', attributes: ['username'] }
            ]
        });

        // Get Socket.IO instance and online users
        const io = socketUtils.getIO();
        const onlineUsers = socketUtils.onlineUsers;

        // Get socket IDs for both sender and receiver
        const senderSocketId = onlineUsers.get(req.user.userId)?.socketId;
        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;

        // Emit to both users
        if (senderSocketId) {
            io.to(senderSocketId).emit('message', messageWithUser);
        }

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('message', messageWithUser);
        }

        res.status(201).json(messageWithUser);
    } catch (error) {
        console.error('Error creating direct message:', error);
        res.status(500).json({ message: 'Error creating direct message' });
    }
});

export default router;