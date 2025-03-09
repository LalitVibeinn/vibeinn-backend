module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('users', 'dailyCommentCount', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
      });

      await queryInterface.addColumn('users', 'lastCommentUpdate', {
          type: Sequelize.STRING,
          allowNull: true
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'dailyCommentCount');
      await queryInterface.removeColumn('users', 'lastCommentUpdate');
  }
};
