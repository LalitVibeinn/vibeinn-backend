// src//Config/Database.config.ts

// new db connection
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from '../Models/User.model';
import Post from '@/Models/Post.model';
import Story from '../Models/Story.model';
import KanbanCard from '@/Models/KanbanCard.model';
import KanbanImage from '@/Models/KanbanImage.model';

dotenv.config();

export const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    models: [User, Post, Story,KanbanCard,KanbanImage],
    logging: false,

    dialectOptions: {
        ssl: {
            require: true, // ✅ Enforce SSL connection
            rejectUnauthorized: false // ✅ Bypass self-signed certificate issues
        }
    },

    pool: {
        max: 5, // ✅ Max concurrent connections
        min: 0, // ✅ Minimum connections
        acquire: 30000, // ✅ Max time (ms) to try getting a connection before throwing error
        idle: 10000, // ✅ Max idle time (ms) before releasing a connection
    },
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        // await sequelize.sync({ alter: true });
        // await sequelize.sync();

        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
})();


