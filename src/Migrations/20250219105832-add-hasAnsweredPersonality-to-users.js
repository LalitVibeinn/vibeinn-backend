'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'has_answered_personality', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // ✅ Default to false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'has_answered_personality');
  }
};
