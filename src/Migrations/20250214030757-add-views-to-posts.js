module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "views", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("posts", "viewedUsers", {
      type: Sequelize.ARRAY(Sequelize.STRING), // ✅ Array of user IDs who have viewed the post
      allowNull: false,
      defaultValue: [],
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("posts", "views");
    await queryInterface.removeColumn("posts", "viewedUsers");
  }
};
