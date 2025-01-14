import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/dbConfig.js';
import http from 'http';
import jwt from 'jsonwebtoken';
import db from './models/index.js';
import uploadRoutes from './routes/uploads.js';

// Import socket utilities
const socketUtils = require('./utils/socket.cjs');

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// Register the /upload route
app.use('/upload', uploadRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO using the utility with CORS settings
const io = socketUtils.init(server, {
  cors: {
    origin: [
        'http://3.145.42.181:3000',  // Production frontend
        'http://localhost:3000',      // Development frontend
        'http://localhost:3001'       // Alternative development port
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const onlineUsers = socketUtils.onlineUsers;

// Create default channel if none exist
async function createDefaultChannel() {
    try {
        const channels = await db.Channel.findAll();
        if (channels.length === 0) {
            await db.Channel.create({
                name: 'General',
                description: 'General discussion channel'
            });
            console.log('Created default channel: General');
        }
    } catch (error) {
        console.error('Error creating default channel:', error);
    }
}

// Socket.IO middleware for authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log('No token provided');
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);

        db.User.findByPk(decoded.userId)
            .then(user => {
                if (!user) {
                    console.log('User not found:', decoded.userId);
                    return next(new Error('User not found'));
                }
                socket.user = {
                    id: user.id,
                    username: user.username
                };
                next();
            })
            .catch(err => {
                console.error('Error finding user:', err);
                next(new Error('Authentication error'));
            });
    } catch (err) {
        console.error('Token verification failed:', err);
        next(new Error('Authentication error'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.user);

    // Add user to online users map
    onlineUsers.set(socket.user.id, {
        ...socket.user,
        socketId: socket.id
    });
    console.log('Updated online users:', Array.from(onlineUsers.values()));
    
    // Broadcast updated user list to all clients
    io.emit('users', Array.from(onlineUsers.values()));

    // Handle getUsers event
    socket.on('getUsers', () => {
        console.log('getUsers requested by:', socket.user.username);
        socket.emit('users', Array.from(onlineUsers.values()));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user);
        if (socket.user) {
            onlineUsers.delete(socket.user.id);
            console.log('Remaining online users:', Array.from(onlineUsers.values()));
            io.emit('users', Array.from(onlineUsers.values()));
        }
    });

    // Handle direct messages
    socket.on('message', (message) => {
        console.log('Message received:', message);
        if (message.type === 'direct') {
            const recipientSocket = Array.from(onlineUsers.values())
                .find(user => user.id === message.receiverId)?.socketId;
            if (recipientSocket) {
                io.to(recipientSocket).emit('message', message);
            }
        }
        socket.emit('message', message); // Send back to sender
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await sequelize.sync({ force: false });
        console.log('Database synchronized without dropping tables.');
        await createDefaultChannel();
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        setTimeout(() => process.exit(1), 1000);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    try {
        await sequelize.close();
        console.log('Database connection closed.');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    try {
        await sequelize.close();
        console.log('Database connection closed.');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit immediately, give time for error handling
    setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    // Don't exit immediately, give time for error handling
    setTimeout(() => process.exit(1), 1000);
});

// Start the server
startServer();