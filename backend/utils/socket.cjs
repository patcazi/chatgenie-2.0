const { Server } = require('socket.io');

let io;
const onlineUsers = new Map();

function init(server, options = {}) {
    io = new Server(server, {
        cors: options.cors || {
            origin: [
                'http://3.145.42.181:3000',
                'http://localhost:3000',
                'http://localhost:3001'
            ],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e6
    });
    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = {
    init,
    getIO,
    onlineUsers
}; 