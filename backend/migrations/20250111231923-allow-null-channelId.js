'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Messages', 'channelId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Channels', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Messages', 'channelId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Channels', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};
