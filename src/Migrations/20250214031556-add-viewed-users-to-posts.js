module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "viewed_users", {
      type: Sequelize.ARRAY(Sequelize.STRING), // ✅ Array of user IDs who have viewed the post
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("posts", "viewed_users");
  }
};
