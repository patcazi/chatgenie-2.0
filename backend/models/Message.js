const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
        static associate(models) {
            Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
            Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
        }
    }

    Message.init({
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
    }, {
        sequelize,
        modelName: 'Message'
    });

    return Message;
};