let io;
const onlineUsers = new Map();

module.exports = {
    init: function(server) {
        io = require('socket.io')(server, {
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001'],
                credentials: true
            }
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