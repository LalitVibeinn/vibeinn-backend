'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Step 1: Add `userId` column as NULLABLE first
    await queryInterface.addColumn('stories', 'userId', {
      type: Sequelize.UUID,
      allowNull: true,  // ✅ Temporarily allow NULL values
      references: {
        model: 'users',
        key: 'userId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // ✅ Step 2: Assign a default `userId` to existing rows (if needed)
    await queryInterface.sequelize.query(`
      UPDATE stories
      SET "userId" = (SELECT "userId" FROM users LIMIT 1)
      WHERE "userId" IS NULL
    `);

    // ✅ Step 3: Change `userId` to NOT NULL
    await queryInterface.changeColumn('stories', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,  // ✅ Now enforce NOT NULL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stories', 'userId');
  }
};
