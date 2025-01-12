'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'sender');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the column if needed when rolling back
    await queryInterface.addColumn('Messages', 'sender', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
