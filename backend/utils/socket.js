let io;
const onlineUsers = new Map();

module.exports = {
    init: function(server) {
        io = require('socket.io')(server, {
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001'],
                credentials: true
            },
            pingTimeout: 60000, // How long to wait for pong before considering connection closed
            pingInterval: 25000, // How often to ping the client
            upgradeTimeout: 30000, // How long to wait for an upgrade to websocket
            maxHttpBufferSize: 1e6 // 1MB max message size
        });
        return io;
    },
    getIO: function() {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
    onlineUsers: onlineUsers
}; 