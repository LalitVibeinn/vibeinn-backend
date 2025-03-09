module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "chatRequests", {
      type: Sequelize.JSON, // Use JSONB for PostgreSQL
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "chatRequests");
  }
};
 