import express from "express";
import { generateAblyToken, sendMessage,createChat,getChatMessages } from "../Controller/chat.controller";
// import { authenticateUser } from "../Controller/Auth.controller";
import { authenticate } from "../Config/clerksetup";

const router = express.Router();

// ✅ Route to get an Ably token
router.get("/api/ably/token", authenticate, generateAblyToken);

// ✅ Route to send a message
// router.post("/api/ably/send", authenticate, sendMessage);

router.post("/api/chat/create", authenticate, createChat);


// ✅ Send a Message in a Chat
router.post("/api/chat/send", authenticate, sendMessage);

// ✅ Get All Messages of a Chatroom
router.get("/api/chat/messages/:chatId", authenticate, getChatMessages);

export default router; 
  