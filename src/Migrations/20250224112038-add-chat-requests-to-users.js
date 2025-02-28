"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "chatRequests", {
      type: Sequelize.ARRAY(Sequelize.JSON),
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "chatRequests");
  },
};
