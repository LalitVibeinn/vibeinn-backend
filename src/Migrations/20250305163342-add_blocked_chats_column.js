"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "blockedChats", {
      type: Sequelize.ARRAY(Sequelize.STRING), // ✅ Store chat IDs
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "blockedChats");
  },
};
