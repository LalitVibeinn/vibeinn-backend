
// // console.log("🟢 Server.ts file is starting...");

// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import { connect } from 'mongoose';
// // import authRoutes from "./Routes/Auth.routes";
// // import userRoutes from "./Routes/UserRoutes.routes";
// // import postRoutes from "./Routes/Post.routes"; // Ensure this is imported
// // import { sequelize } from "./Config/Database.config";
// // import { authenticate } from "./Config/clerksetup"; // Import Clerk auth middleware
// // import webhookRoutes from "./Routes/Webhook.routes";
// // import storyRoutes from "./Routes/Story.routes";
// // import mongoose from "mongoose";
// // import AnonymousNameRoutes from "./Routes/AnonymousName.routes";
// // import cron from "node-cron";
// // import  {syncClerkUsers}  from "./Controller/User.controller"; 
// // import KanbanCardRoutes from "./Routes/Kanban.routes";
// // import chatRoutes from "./Routes/Chat.routes";
// // dotenv.config();

// // const app = express();
// // console.log("🟢 Express App Initialized");

// // app.use(cors());
// // console.log("🟢 CORS Middleware Applied");

// // app.use(express.json());
// // console.log("🟢 JSON Middleware Applied");

// // app.use(express.urlencoded({ extended: true }));
// // console.log("🟢 URL Encoded Middleware Applied");



// // // MongoDB connection
// // const mongoURI = process.env.mongoURI;
// // connect(mongoURI)
// //   .then(() => console.log('Server connected to MongoDB'))
// //   .catch(error => console.error('Failed to connect to MongoDB:', error));


// // const port = process.env.PORT || 5000;

// // sequelize.sync({ alter: true })
// //   .then(() => console.log("✅ Database synchronized"))
// //   .catch((err) => console.error("❌ Database sync error:", err));
  


// // // ✅ Schedule a cron job to run every X hours (e.g., every 3 hours)

// // cron.schedule("0 */3 * * *", async () => {
// //   console.log("🔄 Running scheduled Clerk user sync...");

// //   try {
// //     await syncClerkUsers(); // ✅ Call the sync function without arguments
// //     console.log("✅ Clerk users synced successfully!");
// //   } catch (error) {
// //     console.error("❌ Error syncing Clerk users:", error);
// //   }
// // });

// // console.log("🔹 Loading Auth Routes...");
// // app.use(authRoutes);

// // console.log("🔹 Loading User Routes...");
// // app.use(userRoutes);

// // console.log("🔹 Loading Post Routes...");
// // app.use(postRoutes); // Protect post routes with Clerk

// // console.log("🔹 Loading Webhook Routes...");
// // app.use(webhookRoutes);

// // console.log("🔹 Loading Story Routes...");
// // app.use(storyRoutes);

// // console.log("🔹 Loading Anonymous name Routes...");
// // app.use(AnonymousNameRoutes);

// // console.log("🔹 Loading Kanban Card Routes...");
// // app.use(KanbanCardRoutes);

// // console.log("🔹 Loading Chat Routes...");
// // app.use(chatRoutes);

// // app.get("/", (_req, res) => {
// //   res.send("Clerk Authentication Server Running!");
// // });


// // app.listen(port, () => {
// //   console.log(`✅ Server running on port ${port}`);
// // });


// console.log("🟢 Server.ts file is starting...");

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connect } from 'mongoose';
// import authRoutes from "./Routes/Auth.routes";
// import userRoutes from "./Routes/UserRoutes.routes";
// import postRoutes from "./Routes/Post.routes"; 
// import { sequelize } from "./Config/Database.config";
// import { authenticate } from "./Config/clerksetup"; 
// import webhookRoutes from "./Routes/Webhook.routes";
// import storyRoutes from "./Routes/Story.routes";
// import mongoose from "mongoose";
// import AnonymousNameRoutes from "./Routes/AnonymousName.routes";
// import cron from "node-cron";
// import { syncClerkUsers } from "./Controller/User.controller"; 
// import KanbanCardRoutes from "./Routes/Kanban.routes";
// import chatRoutes from "./Routes/Chat.routes";
// import Chat from "./Models/Chat.model"; // ✅ Import Chat Model
// import avatarRoutes from "./Routes/Avatar.routes";
// import notificationRoutes from "./Routes/Notification.routes";

// dotenv.config();

// const app = express();
// console.log("🟢 Express App Initialized");

// app.use(cors());
// console.log("🟢 CORS Middleware Applied");

// app.use(express.json());
// console.log("🟢 JSON Middleware Applied");

// app.use(express.urlencoded({ extended: true }));
// console.log("🟢 URL Encoded Middleware Applied");

// // ✅ Function to update old chat records
// const updateChats = async () => {
//   try {
//     console.log("🔄 Checking for old chats that need `isAccepted` field...");
//     const result = await Chat.updateMany({}, { $set: { isAccepted: false } });
//     console.log(`✅ Updated ${result.modifiedCount} chat records.`);
//   } catch (error) {
//     console.error("❌ Error updating chat records:", error);
//   }
// };

// // ✅ MongoDB connection
// const mongoURI = process.env.mongoURI;
// connect(mongoURI)
//   .then(async () => {
//     console.log('✅ Server connected to MongoDB');
//     await updateChats();  // ✅ Run update when server starts
//   })
//   .catch(error => console.error('❌ Failed to connect to MongoDB:', error));

// const port = process.env.PORT || 5001;

// sequelize.sync({ alter: true })
//   .then(() => console.log("✅ Database synchronized"))
//   .catch((err) => console.error("❌ Database sync error:", err));

// // ✅ Schedule a cron job to run every X hours (e.g., every 3 hours)
// cron.schedule("0 */3 * * *", async () => {
//   console.log("🔄 Running scheduled Clerk user sync...");
//   try {
//     await syncClerkUsers(); 
//     console.log("✅ Clerk users synced successfully!");
//   } catch (error) {
//     console.error("❌ Error syncing Clerk users:", error);
//   }
// });

// console.log("🔹 Loading Routes...");
// app.use(authRoutes);
// app.use(userRoutes);
// app.use(postRoutes);
// app.use(webhookRoutes);
// app.use(storyRoutes);
// app.use(AnonymousNameRoutes);
// app.use(KanbanCardRoutes);
// app.use(chatRoutes);
// app.use(avatarRoutes);
// app.use(notificationRoutes); 

// app.get("/", (_req, res) => {
//   res.send("Clerk Authentication Server Running!");
// });

// app.listen(port, () => {
//   console.log(`✅ Server running on port ${port}`);
// });



console.log("🟢 Server.ts file is starting...");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io"; // ✅ Import Socket.io

import authRoutes from "./Routes/Auth.routes";
import userRoutes from "./Routes/UserRoutes.routes"; 
import postRoutes from "./Routes/Post.routes";
import { sequelize } from "./Config/Database.config";
import webhookRoutes from "./Routes/Webhook.routes";
import storyRoutes from "./Routes/Story.routes";
import AnonymousNameRoutes from "./Routes/AnonymousName.routes";
import cron from "node-cron";
import { syncClerkUsers } from "./Controller/User.controller";
import KanbanCardRoutes from "./Routes/Kanban.routes";
import chatRoutes from "./Routes/Chat.routes";
import avatarRoutes from "./Routes/Avatar.routes";
import notificationRoutes from "./Routes/Notification.routes";
import Chat from "./Models/Chat.model"; // ✅ Import Chat Model

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

console.log("🟢 Express & WebSocket Server Initialized");

// ✅ Global Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("🟢 Middleware Applied");

// ✅ Function to update old chat records
const updateChats = async () => {
  try {
    console.log("🔄 Checking for old chats that need `isAccepted` field...");
    const result = await Chat.updateMany({}, { $set: { isAccepted: false } });
    console.log(`✅ Updated ${result.modifiedCount} chat records.`);
  } catch (error) {
    console.error("❌ Error updating chat records:", error);
  }
};

// ✅ MongoDB Connection
const mongoURI = process.env.mongoURI;
connect(mongoURI)
  .then(async () => {
    console.log("✅ Server connected to MongoDB");
    await updateChats(); // ✅ Run update when server starts
  })
  .catch((error) => console.error("❌ Failed to connect to MongoDB:", error));

// ✅ Sequelize (PostgreSQL) Sync
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database synchronized"))
  .catch((err) => console.error("❌ Database sync error:", err));

// ✅ Schedule a cron job to sync Clerk users every 3 hours
cron.schedule("0 */3 * * *", async () => {
  console.log("🔄 Running scheduled Clerk user sync...");
  try {
    await syncClerkUsers();
    console.log("✅ Clerk users synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing Clerk users:", error);
  }
});

// ✅ Attach Socket.io to Express Request
app.use((req, res, next) => {
  (req as any).io = io; // ✅ Inject io into requests
  next();
});

// ✅ WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`📩 User joined chat: ${chatId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("newMessage", data);
    console.log(`📩 Message sent to chat: ${data.chatId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ Load Routes
console.log("🔹 Loading Routes...");
app.use(authRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(webhookRoutes);
app.use(storyRoutes);
app.use(AnonymousNameRoutes);
app.use(KanbanCardRoutes);
app.use(chatRoutes);
app.use(avatarRoutes);
app.use(notificationRoutes);

// ✅ Root Route
app.get("/", (_req, res) => {
  res.send("🚀 Clerk Authentication Server Running!");
});

// ✅ Start Server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
