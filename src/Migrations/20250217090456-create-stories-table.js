'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stories', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false  
      },
      userId: {
        type: Sequelize.UUID, // ✅ Link to User table using userId
        allowNull: false,
        references: {
          model: 'users', // ✅ Reference users table
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // ✅ Delete stories if user is deleted
      },
      media: {
        type: Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false // ✅ Keeps stories after 24 hours but hides them from users
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stories');
  }
};
  