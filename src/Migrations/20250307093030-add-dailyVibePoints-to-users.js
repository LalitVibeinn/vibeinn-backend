module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('users', 'dailyVibePoints', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
      });

      await queryInterface.addColumn('users', 'lastVibeUpdate', {
          type: Sequelize.STRING,
          allowNull: true
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'dailyVibePoints');
      await queryInterface.removeColumn('users', 'lastVibeUpdate');
  }
};
