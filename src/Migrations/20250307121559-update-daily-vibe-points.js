module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("users", "dailyVibePoints", {
      type: Sequelize.JSON, // ✅ Convert to JSON
      allowNull: false,
      defaultValue: {},
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("users", "dailyVibePoints", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
