'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'type', {
      type: Sequelize.ENUM('channel', 'direct'),
      allowNull: false,
      defaultValue: 'channel'
    });

    await queryInterface.addColumn('Messages', 'senderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Messages', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'type');
    await queryInterface.removeColumn('Messages', 'senderId');
    await queryInterface.removeColumn('Messages', 'receiverId');
  }
};
