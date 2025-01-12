const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');

const Message = sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    type: {
        type: DataTypes.ENUM('channel', 'direct'),
        allowNull: false,
        defaultValue: 'channel'
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    channelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Channels',
            key: 'id'
        }
    }
});

// Define associations
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = Message;