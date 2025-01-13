let io;
const onlineUsers = new Map();

module.exports = {
    init: function(server, options = {}) {
        io = require('socket.io')(server, {
            cors: options.cors || {
                origin: 'http://3.145.42.181:3000',
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            upgradeTimeout: 30000,
            maxHttpBufferSize: 1e6
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