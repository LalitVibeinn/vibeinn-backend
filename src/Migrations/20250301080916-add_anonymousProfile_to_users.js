module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "anonymousProfile", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "anonymousProfile");
  },
};
