const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');
const socketUtils = require('../utils/socket');

const router = express.Router();

// Get channel messages
router.get('/:channelId', async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const messages = await Message.findAll({
            where: {
                channelId: req.params.channelId,
                type: 'channel'
            },
            include: [
                { model: User, as: 'sender', attributes: ['username'] }
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
        const messages = await Message.findAll({
            where: {
                type: 'direct',
                [Op.or]: [
                    { senderId: req.user.userId, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: req.user.userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['username'] }
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
        const message = await Message.create({
            content,
            channelId,
            type: 'channel',
            senderId: req.user.userId
        });

        const messageWithUser = await Message.findOne({
            where: { id: message.id },
            include: [
                { model: User, as: 'sender', attributes: ['username'] }
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
        console.log('\n=== Creating Direct Message ===');
        console.log('User from token:', req.user);
        console.log('Request body:', req.body);

        // Create the message
        const message = await Message.create({
            content: req.body.content,
            senderId: req.user.userId,
            receiverId: req.body.receiverId,
            type: 'direct'
        });

        console.log('Message created:', message.toJSON());

        // Fetch the complete message with sender info
        const messageWithUser = await Message.findOne({
            where: { id: message.id },
            include: [
                { model: User, as: 'sender', attributes: ['username'] }
            ]
        });

        console.log('Message with user:', messageWithUser.toJSON());

        // Get Socket.IO instance and online users
        const io = socketUtils.getIO();
        const onlineUsers = socketUtils.onlineUsers;

        // Get socket IDs for both sender and receiver
        const senderSocketId = onlineUsers.get(req.user.userId)?.socketId;
        const receiverSocketId = onlineUsers.get(req.body.receiverId)?.socketId;

        console.log('Socket IDs:', {
            sender: { id: req.user.userId, socketId: senderSocketId },
            receiver: { id: req.body.receiverId, socketId: receiverSocketId }
        });

        // Emit to both users
        if (senderSocketId) {
            console.log('Emitting to sender:', senderSocketId);
            io.to(senderSocketId).emit('message', messageWithUser);
        } else {
            console.log('Sender socket not found');
        }

        if (receiverSocketId) {
            console.log('Emitting to receiver:', receiverSocketId);
            io.to(receiverSocketId).emit('message', messageWithUser);
        } else {
            console.log('Receiver socket not found');
        }

        res.status(201).json(messageWithUser);
    } catch (error) {
        console.error('Error creating direct message:', error);
        res.status(500).json({ 
            message: 'Error creating direct message',
            error: error.message 
        });
    }
});

module.exports = router;