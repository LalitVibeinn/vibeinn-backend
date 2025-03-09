module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "phone");
  },
};
