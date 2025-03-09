"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "blockedUsers", {
      type: Sequelize.ARRAY(Sequelize.STRING), // Storing array of usernames (or user IDs)
      allowNull: false,
      defaultValue: [], // Default empty array
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "blockedUsers");
  },
};
