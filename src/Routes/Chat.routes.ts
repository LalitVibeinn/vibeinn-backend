import express from "express";
import { generateAblyToken, 
    sendMessage,
    createChat,
    getChatMessages,
    sendChatRequest,
    getChatRequests,
    acceptChatRequest,
    rejectChatRequest,
    getUserChats,
    getAcceptedChats,
    sharePost,
    blockChat,
    sharePostWithMultipleUsers,
    unblockChat
} from "../Controller/Chat.controller";
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


// ✅ Send chat request
router.post("/api/chat/request", authenticate, sendChatRequest);

// ✅ Get chat requests
router.get("/api/chat/requests", authenticate, getChatRequests);

// ✅ Accept chat request
router.post("/api/chat/accept", authenticate, acceptChatRequest);

// ✅ Reject chat request
router.post("/api/chat/reject", authenticate, rejectChatRequest);


// ✅ New Route to Get User Chats
router.get("/api/chat/mychats", authenticate, getUserChats);

// Route to only show accepted chat user
router.get("/api/chat/accepted-requests", authenticate, getAcceptedChats);

// ✅ New Route: Share a Post via Chat
router.post("/api/chat/share-post", authenticate, sharePost);

// ✅ Route to block a chat
router.post("/api/chat/block", authenticate, blockChat);


// ✅ New Route: Share a Post with Multiple Users
router.post("/api/chat/share-post-multiple", authenticate, sharePostWithMultipleUsers);


// ✅ Unblock a Chat (New Route)
router.post("/api/chat/unblock", authenticate, unblockChat);
export default router; 
  

