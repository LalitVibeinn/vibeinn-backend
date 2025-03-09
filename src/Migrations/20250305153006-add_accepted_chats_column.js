"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "acceptedChats", {
      type: Sequelize.ARRAY(Sequelize.STRING), // ✅ Store chat IDs as an array of strings
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "acceptedChats");
  },
};
