const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Channel = sequelize.define('Channel', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = Channel;
