import { Request, Response } from "express";
import Ably from "ably";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MyRequest } from "../Interfaces/Request.interface";
import User from "../Models/User.model"; // ✅ Import your Postgres User model
import Chat from "../Models/Chat.model";
import Message from "../Models/Message.model";
import mongoose from "mongoose";
dotenv.config();

const ABLY_API_KEY = process.env.ABLY_API_KEY as string;
const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;
const ably = new Ably.Rest(ABLY_API_KEY);

export const generateAblyToken = async (req: MyRequest, res: Response) => {
  try {
    console.log("🔹 Incoming Headers:", req.headers);

    // ✅ Extract JWT Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, SECRET_KEY);
      console.log("🔹 Decoded Token:", decodedToken);
    } catch (err) {
      console.error("❌ JWT Verification Failed:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // ✅ Extract username from the token (same as Post APIs)
    const { username, clerkId } = decodedToken;
    if (!username || !clerkId) {
      return res.status(401).json({ message: "Unauthorized: No username or Clerk ID in JWT" });
    }

    // ✅ Fetch user from Postgres first (like your Post APIs)
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // ✅ Generate Ably Token Request using the Postgres user ID
    const tokenRequest = await ably.auth.createTokenRequest({ clientId: user.userId });

    return res.json(tokenRequest);
  } catch (error) {
    console.error("❌ Error generating Ably token:", error);
    return res.status(500).json({ error: "Failed to generate Ably token" });
  }
};


  
/**
 * ✅ Send Message using Ably
 */
// export const sendMessage = async (req: MyRequest, res: Response) => {
//   try {
//     // ✅ Extract JWT Token
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Missing or invalid token" });
//     }

//     const token = authHeader.split(" ")[1];
//     let decodedToken;
//     try {
//       decodedToken = jwt.verify(token, SECRET_KEY);
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }

//     // ✅ Extract user details from token
//     const { userId, username } = decodedToken;
//     if (!userId || !username) {
//       return res.status(401).json({ message: "Unauthorized: No user details in JWT" });
//     }

//     // ✅ Extract message and channel name from request body
//     const { message, channelName } = req.body;
//     if (!message || !channelName) {
//       return res.status(400).json({ error: "Message and channelName are required" });
//     }

//     // ✅ Publish message to the specified channel
//     const chatChannel = ably.channels.get(channelName);
//     await chatChannel.publish("message", {
//       text: message,
//       sender: username,
//       senderId: userId,
//       timestamp: new Date().toISOString(),
//     });

//     return res.json({ message: "Message sent successfully" });
//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     return res.status(500).json({ error: "Failed to send message" });
//   }
// };




export const createChat = async (req: Request, res: Response) => {
    try {
      const { type, participants } = req.body;
  
      if (!participants || participants.length < 2) {
        return res.status(400).json({ message: "At least two participants required" });
      }
  
      const chat = await Chat.create({ type, participants });
      return res.status(201).json({ message: "Chat created", chat });
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  /**
   * ✅ Send a Message in a Chatroom
   */
  export const sendMessage = async (req: Request, res: Response) => {
    try {
      const { chatId, sender, text, media } = req.body;
  
      if (!chatId || !sender || !text) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const message1 = await Message.create({
        chatId,
        sender,
        text,
        media,
        readBy: []
      });
  
      return res.status(201).json({ message: "Message sent", message1 });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  /**
   * ✅ Get Messages from a Chatroom
   */
  export const getChatMessages = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }
  
      const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
  
      return res.status(200).json({ messages });
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  