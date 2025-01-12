const app = require('./app');
const sequelize = require('./config/dbConfig');
const http = require('http');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Channel = require('./models/Channel');
const socketUtils = require('./utils/socket');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = 'your-secret-key';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO using the utility
const io = socketUtils.init(server);
const onlineUsers = socketUtils.onlineUsers;

// Create default channel if none exist
async function createDefaultChannel() {
    try {
        const channels = await Channel.findAll();
        if (channels.length === 0) {
            await Channel.create({
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
    console.log('Socket auth token:', token);
    
    if (!token) {
        console.log('No token provided');
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        User.findByPk(decoded.userId)
            .then(user => {
                if (!user) {
                    console.log('User not found:', decoded.userId);
                    return next(new Error('User not found'));
                }
                
                socket.user = {
                    id: user.id,
                    username: decoded.username // Include username from token
                };
                console.log('Socket user set:', socket.user);
                next();
            })
            .catch(err => {
                console.error('Error finding user:', err);
                next(new Error('Database error'));
            });
    } catch (err) {
        console.error('Token verification error:', err);
        next(new Error('Authentication error'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);
    
    if (!socket.user) {
        console.log('No user data found for socket:', socket.id);
        socket.disconnect();
        return;
    }

    // Add user to online users map
    onlineUsers.set(socket.user.id, {
        id: socket.user.id,
        username: socket.user.username,
        socketId: socket.id
    });
    
    console.log('User added to online users:', socket.user);
    console.log('Current online users:', Array.from(onlineUsers.values()));

    // Broadcast updated users list to all clients
    io.emit('users', Array.from(onlineUsers.values()));

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        if (socket.user) {
            console.log('Removing user from online users:', socket.user);
            onlineUsers.delete(socket.user.id);
            io.emit('users', Array.from(onlineUsers.values()));
        }
    });

    // Handle incoming messages
    socket.on('message', async (data) => {
        try {
            console.log('\n=== Received Message ===');
            console.log('From user:', socket.user);
            console.log('Message data:', data);

            // Message will be saved and emitted by the message routes
            // This handler is just for logging and verification
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', { message: 'Error handling message' });
        }
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