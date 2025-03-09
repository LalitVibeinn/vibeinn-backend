'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      senderId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users', // Reference Users Table
          key: 'userId',
        },
        onDelete: 'CASCADE',
      },
      receiverId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users', // Reference Users Table
          key: 'userId',
        },
        onDelete: 'CASCADE',
      },
      postId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'posts', // Reference Posts Table
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  },
};
