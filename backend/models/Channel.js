const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Channel extends Model {
        static associate(models) {
            // Add any associations here if needed
        }
    }

    Channel.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Channel'
    });

    return Channel;
};
