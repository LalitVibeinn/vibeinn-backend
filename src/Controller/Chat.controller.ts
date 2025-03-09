//Controller/Chat.controller.ts
import { Request, Response } from "express";
import Ably from "ably";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MyRequest } from "../Interfaces/Request.interface";
import User from "../Models/User.model"; 
import Chat from "../Models/Chat.model";
import Message from "../Models/Message.model";
import mongoose from "mongoose";
import Post from "@/Models/Post.model";
import { updateVibeScore } from "../Controller/Post.controller"; // ✅ Import updateVibeScore

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
  
 
  export const sendMessage = async (req: MyRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId } = decodedToken;
      const { chatId, text } = req.body;
  
      if (!chatId || !text) {
        return res.status(400).json({ message: "Chat ID and message text are required" });
      }
  
      const user = await User.findOne({ where: { userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Prevent sending messages in blocked chats
      if (user.blockedChats.includes(chatId)) {
        return res.status(403).json({ message: "You have blocked this chat. Unblock to send messages." });
      }
  
      const message1 = await Message.create({
        chatId,
        sender: { userId, fullName: user.username, profilePic: user.profile },
        text,
        timestamp: new Date(),
        readBy: [],
      });
  
      return res.status(201).json({ message: "Message sent", message1 });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
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
  



 
  // export const sendChatRequest = async (req: MyRequest, res: Response) => {
  //   try {
  //     console.log("🔹 Incoming Chat Request:", req.body); // ✅ Log Request Body
  
  //     // ✅ Extract Token
  //     const authHeader = req.headers.authorization;
  //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //       return res.status(401).json({ message: "Missing or invalid token" });
  //     }
  
  //     const token = authHeader.split(" ")[1];
  //     let decodedToken;
  //     try {
  //       decodedToken = jwt.verify(token, SECRET_KEY);
  //       console.log("🔹 Decoded Token:", decodedToken);
  //     } catch (err) {
  //       return res.status(401).json({ message: "Invalid or expired token" });
  //     }
  
  //     const { userId, username, anonymousName, isAnonymous, anonymousProfile } = decodedToken;
  //     const { recipientId } = req.body;
  
  //     if (!recipientId) {
  //       return res.status(400).json({ message: "Recipient ID is required" });
  //     }
  
  //     // ✅ Fetch Recipient User
  //     const recipient = await User.findOne({ where: { userId: recipientId } });
  //     if (!recipient) {
  //       return res.status(404).json({ message: "Recipient not found" });
  //     }
  
  //     console.log("✅ Recipient Found:", recipient.username);
  
  //     // ✅ Check if a request already exists
  //     if (recipient.chatRequests.some((req) => req.senderId === userId)) {
  //       console.log("❌ Chat Request Already Exists");
  //       return res.status(400).json({ message: "Chat request already sent" });
  //     }
  
  //     // ✅ Generate Greeting Message
  //     const greetingMessage = `Hi ${recipient.username}, let's connect and chat!`;
  
  //     // ✅ Add New Chat Request with Greeting Message
  //     recipient.chatRequests.push({
  //       senderId: userId,
  //       senderName: isAnonymous ? anonymousName : username,
  //       isAnonymous: isAnonymous,
  //       anonymousProfile: isAnonymous ? anonymousProfile : null,
  //       greetingMessage: greetingMessage, // ✅ Always include the greeting message
  //     });
  
  //     // 🔥 Force Sequelize to detect changes
  //     recipient.changed("chatRequests", true);
  //     await recipient.save();
  
  //     console.log("✅ Chat Request Sent Successfully with Greeting Message");
  
  //     return res.status(200).json({ message: "Chat request sent successfully with greeting message" });
  //   } catch (error) {
  //     console.error("❌ Error sending chat request:", error);
  //     return res.status(500).json({ message: "Internal server error", error: error.message });
  //   }
  // };
  

  export const sendChatRequest = async (req: MyRequest, res: Response) => {
    try {
        console.log("🔹 Incoming Chat Request:", req.body);

        // ✅ Extract Token
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
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const { userId, username, anonymousName, isAnonymous, anonymousProfile } = decodedToken;
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required" });
        }

        // ✅ Fetch Sender and Recipient Users
        const sender = await User.findOne({ where: { userId } });
        const recipient = await User.findOne({ where: { userId: recipientId } });

        if (!sender || !recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Recipient Found:", recipient.username);

        // ✅ Check if a request already exists
        if (recipient.chatRequests.some((req) => req.senderId === userId)) {
            console.log("❌ Chat Request Already Exists");
            return res.status(400).json({ message: "Chat request already sent" });
        }

        // ✅ Generate Greeting Message
        const greetingMessage = `Hi ${recipient.username}, let's connect and chat!`;

        // ✅ Add New Chat Request with Greeting Message
        recipient.chatRequests.push({
            senderId: userId,
            senderName: isAnonymous ? anonymousName : username,
            isAnonymous: isAnonymous,
            anonymousProfile: isAnonymous ? anonymousProfile : null,
            greetingMessage: greetingMessage,
        });

        // 🔥 Force Sequelize to detect changes
        recipient.changed("chatRequests", true);
        await recipient.save();

        console.log("✅ Chat Request Sent Successfully with Greeting Message");

        // ✅ Calculate today's date to track daily points
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // ✅ Ensure dailyVibePoints is an object and not a number
        if (typeof sender.dailyVibePoints !== "object") sender.dailyVibePoints = {};
        if (typeof recipient.dailyVibePoints !== "object") recipient.dailyVibePoints = {};

        // ✅ Ensure dailyVibePoints is a properly typed object
        sender.dailyVibePoints = sender.dailyVibePoints as Record<string, number>;
        recipient.dailyVibePoints = recipient.dailyVibePoints as Record<string, number>;

        sender.dailyVibePoints[today] = sender.dailyVibePoints[today] || 0;
        recipient.dailyVibePoints[today] = recipient.dailyVibePoints[today] || 0;

        // ✅ Ensure users don’t exceed 50 daily points
        let senderRemainingLimit = sender.dailyVibePoints.remainingLimit || 50;
        let recipientRemainingLimit = recipient.dailyVibePoints.remainingLimit || 50;

        // ✅ Award points if within daily limit
        let senderPoints = senderRemainingLimit > 0 ? 1 : 0;
        let recipientPoints = recipientRemainingLimit > 0 ? 2 : 0;

        // ✅ Deduct points from daily limit
        sender.dailyVibePoints.remainingLimit = Math.max(0, senderRemainingLimit - senderPoints);
        recipient.dailyVibePoints.remainingLimit = Math.max(0, recipientRemainingLimit - recipientPoints);

        // ✅ Increase VibeScore if within the daily limit
        sender.vibeScore += senderPoints;
        recipient.vibeScore += recipientPoints;

        console.log(`✅ Vibe Scores Updated: ${sender.username} (+${senderPoints}), ${recipient.username} (+${recipientPoints})`);
        console.log(`✅ Remaining Limits: ${sender.username} (${sender.dailyVibePoints.remainingLimit}), ${recipient.username} (${recipient.dailyVibePoints.remainingLimit})`);

        // ✅ Ensure `dailyVibePoints` changes are detected by Sequelize
        sender.set("dailyVibePoints", sender.dailyVibePoints);
        recipient.set("dailyVibePoints", recipient.dailyVibePoints);

        // ✅ Save the updated VibeScore and limits
        sender.changed("vibeScore", true);
        sender.changed("dailyVibePoints", true);
        await sender.save();

        recipient.changed("vibeScore", true);
        recipient.changed("dailyVibePoints", true);
        await recipient.save();

        return res.status(200).json({
            message: "Chat request sent successfully with greeting message",
            senderVibeScore: sender.vibeScore,
            recipientVibeScore: recipient.vibeScore,
            senderRemainingLimit: sender.dailyVibePoints.remainingLimit,
            recipientRemainingLimit: recipient.dailyVibePoints.remainingLimit
        });
    } catch (error) {
        console.error("❌ Error sending chat request:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




 
  export const getChatRequests = async (req: MyRequest, res: Response) => {
    try {
        console.log("🔹 Fetching Chat Requests...");

        // ✅ Extract Token
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
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const { userId } = decodedToken;

        // ✅ Fetch the current user
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Current User:", user.username);
        console.log("🔍 Pending Requests Before Fetching:", user.chatRequests);

        // ✅ Fetch details of each sender, including sharedPost
        const enrichedRequests = await Promise.all(
            user.chatRequests.map(async (request) => {
                const sender = await User.findOne({ where: { userId: request.senderId } });

                // Fetch shared post if available
                let sharedPostDetails = null;
                if (request.sharedPost?.postId) {
                    const post = await Post.findByPk(request.sharedPost.postId);
                    if (post) {
                        sharedPostDetails = {
                            postId: post.id,
                            caption: post.caption,
                            media: post.media,
                        };
                    }
                }

                return {
                    senderId: request.senderId,
                    senderName: request.senderName,
                    anonymousName: sender?.anonymousName || "Anonymous",
                    isAnonymous: sender?.isAnonymous || false,
                    profilePic: sender?.profile || "https://default-image.com/default.png",
                    anonymousProfile: sender?.isAnonymous ? sender?.anonymousProfile : null,
                    greetingMessage: request.greetingMessage || "Hi, let's connect!",
                    sharedPost: sharedPostDetails, // ✅ Now includes shared post details
                };
            })
        );

        console.log("✅ Enriched Chat Requests:", enrichedRequests);

        return res.status(200).json({ chatRequests: enrichedRequests });
    } catch (error) {
        console.error("❌ Error fetching chat requests:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

  // export const acceptChatRequest = async (req: MyRequest, res: Response) => {
  //   try {
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
  
  //     const { userId, username } = decodedToken;
  //     const { senderId } = req.body;
  
  //     if (!senderId) {
  //       return res.status(400).json({ message: "Sender ID is required" });
  //     }
  
  //     const recipient = await User.findOne({ where: { userId } });
  //     const sender = await User.findOne({ where: { userId: senderId } });
  
  //     if (!recipient || !sender) {
  //       return res.status(404).json({ message: "User not found" });
  //     }
  
  //     // ✅ Remove request from recipient's list
  //     recipient.chatRequests = recipient.chatRequests.filter((req) => req.senderId !== senderId);
  //     await recipient.save();
  
  //     // ✅ Create or Update Chat
  //     let chat = await Chat.findOne({
  //       "participants.userId": { $all: [userId, senderId] }
  //     });
  
  //     if (!chat) {
  //       chat = await Chat.create({
  //         type: "private",
  //         participants: [
  //           {
  //             userId: sender.userId,
  //             fullName: sender.username,
  //             profilePic: sender.profile,
  //           },
  //           {
  //             userId: recipient.userId,
  //             fullName: recipient.username,
  //             profilePic: recipient.profile,
  //           },
  //         ],
  //         isAccepted: true,
  //       });
  //     } else {
  //       await Chat.updateOne({ _id: chat._id }, { $set: { isAccepted: true } });
  //     }
  
  //     console.log("✅ Chat request accepted successfully:", chat);
  //     return res.status(201).json({ message: "Chat request accepted", chat });
  //   } catch (error) {
  //     console.error("❌ Error accepting chat request:", error);
  //     return res.status(500).json({ message: "Internal server error", error: error.message });
  //   }
  // };
  
  export const acceptChatRequest = async (req: MyRequest, res: Response) => {
    try {
      // ✅ Extract Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId } = decodedToken;
      const { senderId } = req.body;
  
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
  
      // ✅ Fetch recipient & sender from database
      const recipient = await User.findOne({ where: { userId } });
      const sender = await User.findOne({ where: { userId: senderId } });
  
      if (!recipient || !sender) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Remove request from recipient's list
      recipient.chatRequests = recipient.chatRequests.filter(req => req.senderId !== senderId);
      await recipient.save(); // ✅ Save changes
  
      // ✅ Check if chat already exists
      let chat = await Chat.findOne({
        "participants.userId": { $all: [userId, senderId] },
      });
  
      if (!chat) {
        chat = await Chat.create({
          type: "private",
          participants: [
            { userId: sender.userId, fullName: sender.username, profilePic: sender.profile },
            { userId: recipient.userId, fullName: recipient.username, profilePic: recipient.profile },
          ],
          isAccepted: true,
        });
      } else {
        await Chat.updateOne({ _id: chat._id }, { $set: { isAccepted: true } });
      }
  
      // ✅ Add chat ID to acceptedChats
      if (!recipient.acceptedChats.includes(chat._id.toString())) {
        recipient.acceptedChats.push(chat._id.toString());
      }
  
      if (!sender.acceptedChats.includes(chat._id.toString())) {
        sender.acceptedChats.push(chat._id.toString());
      }
  
      // ✅ Force Sequelize to detect changes
      recipient.changed("acceptedChats", true);
      sender.changed("acceptedChats", true);
      
      await recipient.save();
      await sender.save();
  
      console.log("✅ Chat request accepted successfully:", chat);
      return res.status(201).json({ message: "Chat request accepted", chat });
    } catch (error) {
      console.error("❌ Error accepting chat request:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
  
  export const getUserChats = async (req: MyRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId } = decodedToken;
  
      // Find all chats where the user is a participant
      const chats = await Chat.find({ "participants.userId": userId });
  
      if (!chats || chats.length === 0) {
        return res.status(200).json({ message: "No chats found", chats: [] });
      }
  
      return res.status(200).json({ chats });
    } catch (error) {
      console.error("❌ Error fetching user chats:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

  
 
  export const getAcceptedChats = async (req: MyRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId } = decodedToken;
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Exclude blocked chats
    const chats = await Chat.find({
      _id: { $in: user.acceptedChats, $nin: user.blockedChats },
    });

    return res.status(200).json({ chats });
  } catch (error) {
    console.error("❌ Error fetching accepted chats:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

   
  export const rejectChatRequest = async (req: MyRequest, res: Response) => {
    try {
      console.log("🔹 Incoming Reject Request:", req.body);
  
      // ✅ Extract Token
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
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId } = decodedToken;
      const { senderId } = req.body;
  
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
  
      // ✅ Fetch the current user (Recipient of the chat request)
      const user = await User.findOne({ where: { userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("✅ Current User Found:", user.username);
      console.log("🔍 Before Update: chatRequests =", user.chatRequests);
  
      // ✅ Check if the request exists
      const requestIndex = user.chatRequests.findIndex((req) => req.senderId === senderId);
      if (requestIndex === -1) {
        return res.status(400).json({ message: "No pending chat request from this user" });
      }
  
      // ✅ Remove the request
      user.chatRequests.splice(requestIndex, 1);
  
      // 🔥 Force Sequelize to detect changes
      user.changed("chatRequests", true);
      await user.save();
  
      console.log("✅ After Update: chatRequests =", user.chatRequests);
      console.log("✅ Chat Request Rejected Successfully");
  
      return res.status(200).json({ message: `Chat request from ${senderId} rejected` });
    } catch (error) {
      console.error("❌ Error rejecting chat request:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

  

  // export const sharePost = async (req: MyRequest, res: Response) => {
  //   try {
  //     console.log("🔹 Incoming Share Post Request:", req.body);
  
  //     // ✅ Extract Authorization Token
  //     const authHeader = req.headers.authorization;
  //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //       return res.status(401).json({ message: "Missing or invalid token" });
  //     }
  
  //     const token = authHeader.split(" ")[1];
  //     let decodedToken;
  //     try {
  //       decodedToken = jwt.verify(token, SECRET_KEY);
  //       console.log("🔹 Decoded Token:", decodedToken);
  //     } catch (err) {
  //       return res.status(401).json({ message: "Invalid or expired token" });
  //     }
  
  //     const { userId, username, anonymousName, isAnonymous, anonymousProfile } = decodedToken;
  //     const { recipientId, postId } = req.body;
  
  //     if (!recipientId || !postId) {
  //       return res.status(400).json({ message: "Recipient ID and Post ID are required" });
  //     }
  
  //     // ✅ Fetch Post Details
  //     const post = await Post.findByPk(postId);
  //     if (!post) {
  //       return res.status(404).json({ message: "Post not found" });
  //     }
  
  //     // ✅ Fetch Recipient User
  //     const recipient = await User.findOne({ where: { userId: recipientId } });
  //     if (!recipient) {
  //       return res.status(404).json({ message: "Recipient not found" });
  //     }
  
  //     console.log("✅ Recipient Found:", recipient.username);
  
  //     // ✅ Ensure recipient.following is an array
  //     const recipientFollowing = Array.isArray(recipient.following) ? recipient.following : [];
  
  //     // ✅ Check if the sender is a friend
  //     const isFriend = recipientFollowing.includes(username);
  
  //     if (isFriend) {
  //       console.log("✅ User is a friend, sending post directly in chat...");
  
  //       // ✅ Check if a chat already exists
  //       let chat = await Chat.findOne({
  //         "participants.userId": { $all: [userId, recipientId] }
  //       });
  
  //       if (!chat) {
  //         console.log("❌ No chat found, creating a new one...");
  //         chat = await Chat.create({
  //           type: "private",
  //           participants: [
  //             {
  //               userId: userId,
  //               fullName: username,
  //               anonymousName: anonymousName || null,
  //               profilePic: anonymousProfile || null,
  //             },
  //             {
  //               userId: recipient.userId,
  //               fullName: recipient.username,
  //               anonymousName: recipient.anonymousName || null,
  //               profilePic: recipient.profile || null,
  //             },
  //           ],
  //           isAccepted: true, // ✅ Since they are friends
  //         });
  //       }
  
  //       // ✅ Send post as a message in the chat
  //       const message1 = await Message.create({
  //         chatId: chat._id,
  //         sender: {
  //           userId,
  //           fullName: username,
  //           profilePic: anonymousProfile || null,
  //         },
  //         text: `📢 Shared Post: ${post.caption}`,
  //         media: post.media.length > 0 ? post.media[0] : null,
  //         timestamp: new Date(),
  //         readBy: [],
  //       });
  
  //       return res.status(200).json({ message: "Post shared successfully via chat", chatId: chat._id, message1 });
  //     } else {
  //       console.log("❌ User is NOT a friend, sending with chat request...");
  
  //       // ✅ Check if chat request already exists
  //       if (recipient.chatRequests.some((req) => req.senderId === userId)) {
  //         console.log("❌ Chat Request Already Exists");
  //         return res.status(400).json({ message: "Chat request already sent with a post" });
  //       }
  
  //       // ✅ Add New Chat Request with Shared Post
  //       recipient.chatRequests.push({
  //         senderId: userId,
  //         senderName: isAnonymous ? anonymousName : username,
  //         isAnonymous: isAnonymous,
  //         anonymousProfile: isAnonymous ? anonymousProfile : null,
  //         sharedPost: {
  //           postId: post.id,
  //           caption: post.caption,
  //           media: post.media,
  //         },
  //       });
  
  //       // 🔥 Force Sequelize to detect changes
  //       recipient.changed("chatRequests", true);
  //       await recipient.save();
  
  //       console.log("✅ Chat Request Sent Successfully with Shared Post");
  
  //       return res.status(200).json({ message: "Post shared along with a chat request" });
  //     }
  //   } catch (error) {
  //     console.error("❌ Error sharing post:", error);
  //     return res.status(500).json({ message: "Internal server error", error: error.message });
  //   }
  // };
  
  export const sharePost = async (req: MyRequest, res: Response) => {
    try {
      console.log("🔹 Incoming Share Post Request:", req.body);
  
      // ✅ Extract Authorization Token
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
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId, username, anonymousName, isAnonymous, anonymousProfile } = decodedToken;
      const { recipientId, postId } = req.body;
  
      if (!recipientId || !postId) {
        return res.status(400).json({ message: "Recipient ID and Post ID are required" });
      }
  
      // ✅ Fetch Post Details
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // ✅ Fetch Recipient User
      const recipient = await User.findOne({ where: { userId: recipientId } });
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
  
      console.log("✅ Recipient Found:", recipient.username);
  
      // ✅ Ensure recipient.following is an array
      const recipientFollowing = Array.isArray(recipient.following) ? recipient.following : [];
  
      // ✅ Check if the sender is a friend
      const isFriend = recipientFollowing.includes(username);
  
      if (isFriend) {
        console.log("✅ User is a friend, sending post directly in chat...");
  
        // ✅ Check if a chat already exists
        let chat = await Chat.findOne({
          "participants.userId": { $all: [userId, recipientId] }
        });
  
        if (!chat) {
          console.log("❌ No chat found, creating a new one...");
          chat = await Chat.create({
            type: "private",
            participants: [
              {
                userId: userId,
                fullName: username,
                anonymousName: anonymousName || null,
                profilePic: anonymousProfile || null,
              },
              {
                userId: recipient.userId,
                fullName: recipient.username,
                anonymousName: recipient.anonymousName || null,
                profilePic: recipient.profile || null,
              },
            ],
            isAccepted: true, // ✅ Since they are friends
          });
        }
  
        // ✅ Send post as a message in the chat
        const message1 = await Message.create({
          chatId: chat._id,
          sender: {
            userId,
            fullName: username,
            profilePic: anonymousProfile || null,
          },
          text: `📢 Shared Post: ${post.caption}`,
          media: post.media.length > 0 ? post.media[0] : null,
          timestamp: new Date(),
          readBy: [],
        });
  
        return res.status(200).json({ message: "Post shared successfully via chat", chatId: chat._id, message1 });
      } else {
        console.log("❌ User is NOT a friend, sending with chat request...");
  
        // ✅ Check if chat request already exists
        if (recipient.chatRequests.some((req) => req.senderId === userId)) {
          console.log("❌ Chat Request Already Exists");
          return res.status(400).json({ message: "Chat request already sent with a post" });
        }
  
        // ✅ Generate Greeting Message
        const greetingMessage = `Hi ${recipient.username}, let's connect and chat!`;
  
        // ✅ Add New Chat Request with Shared Post and Greeting Message
        recipient.chatRequests.push({
          senderId: userId,
          senderName: isAnonymous ? anonymousName : username,
          isAnonymous: isAnonymous,
          anonymousProfile: isAnonymous ? anonymousProfile : null,
          greetingMessage: greetingMessage, // ✅ Now this will not throw an error
          sharedPost: {
            postId: post.id,
            caption: post.caption,
            media: post.media,
          },
        });
  
        // 🔥 Force Sequelize to detect changes
        recipient.changed("chatRequests", true);
        await recipient.save();
  
        console.log("✅ Chat Request Sent Successfully with Shared Post and Greeting Message");
  
        return res.status(200).json({ message: "Post shared along with a chat request and greeting message" });
      }
    } catch (error) {
      console.error("❌ Error sharing post:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

  export const sharePostWithMultipleUsers = async (req: MyRequest, res: Response) => {
    try {
      console.log("🔹 Incoming Share Post Request:", req.body);
  
      // ✅ Extract Authorization Token
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
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId, username, anonymousName, isAnonymous, anonymousProfile } = decodedToken;
      const { recipientIds, postId } = req.body;
  
      if (!recipientIds || recipientIds.length === 0 || !postId) {
        return res.status(400).json({ message: "Recipient IDs and Post ID are required" });
      }
  
      // ✅ Fetch Post Details
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // ✅ Fetch All Recipients in a Single Query
      const recipients = await User.findAll({ where: { userId: recipientIds } });
  
      if (!recipients || recipients.length === 0) {
        return res.status(404).json({ message: "No valid recipients found" });
      }
  
      console.log(`✅ Found ${recipients.length} recipients`);
  
      let responseArray = [];
  
      for (const recipient of recipients) {
        console.log(`🔹 Processing recipient: ${recipient.username}`);
  
        // ✅ Ensure recipient.following is an array
        const recipientFollowing = Array.isArray(recipient.following) ? recipient.following : [];
  
        // ✅ Check if the sender is a friend
        const isFriend = recipientFollowing.includes(username);
  
        if (isFriend) {
          console.log(`✅ ${recipient.username} is a friend, sending post via chat...`);
  
          // ✅ Check if a chat already exists
          let chat = await Chat.findOne({
            "participants.userId": { $all: [userId, recipient.userId] },
          });
  
          if (!chat) {
            console.log("❌ No chat found, creating a new one...");
            chat = await Chat.create({
              type: "private",
              participants: [
                {
                  userId: userId,
                  fullName: username,
                  anonymousName: anonymousName || null,
                  profilePic: anonymousProfile || null,
                },
                {
                  userId: recipient.userId,
                  fullName: recipient.username,
                  anonymousName: recipient.anonymousName || null,
                  profilePic: recipient.profile || null,
                },
              ],
              isAccepted: true, // ✅ Since they are friends
            });
          }
  
          // ✅ Send post as a message in the chat
          const message1 = await Message.create({
            chatId: chat._id,
            sender: {
              userId,
              fullName: username,
              profilePic: anonymousProfile || null,
            },
            text: `📢 Shared Post: ${post.caption}`,
            media: post.media.length > 0 ? post.media[0] : null,
            timestamp: new Date(),
            readBy: [],
          });
  
          responseArray.push({
            recipientId: recipient.userId,
            status: "Shared via chat",
            chatId: chat._id,
            message: message1,
          });
        } else {
          console.log(`❌ ${recipient.username} is NOT a friend, sending with chat request...`);
  
          // ✅ Check if chat request already exists
          if (recipient.chatRequests.some((req) => req.senderId === userId)) {
            console.log(`❌ Chat Request Already Exists for ${recipient.username}`);
            responseArray.push({
              recipientId: recipient.userId,
              status: "Chat request already sent",
            });
            continue;
          }
  
          // ✅ Generate Greeting Message
          const greetingMessage = `Hi ${recipient.username}, let's connect and chat!`;
  
          // ✅ Add New Chat Request with Shared Post and Greeting Message
          recipient.chatRequests.push({
            senderId: userId,
            senderName: isAnonymous ? anonymousName : username,
            isAnonymous: isAnonymous,
            anonymousProfile: isAnonymous ? anonymousProfile : null,
            greetingMessage: greetingMessage,
            sharedPost: {
              postId: post.id,
              caption: post.caption,
              media: post.media,
            },
          });
  
          // 🔥 Force Sequelize to detect changes
          recipient.changed("chatRequests", true);
          await recipient.save();
  
          responseArray.push({
            recipientId: recipient.userId,
            status: "Chat request sent with post",
          });
        }
      }
  
      console.log("✅ Post sharing process completed.");
  
      return res.status(200).json({ message: "Post sharing completed", results: responseArray });
    } catch (error) {
      console.error("❌ Error sharing post:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  

  export const blockChat = async (req: MyRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { userId } = decodedToken;
      const { chatId } = req.body;
  
      if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
      }
  
      const user = await User.findOne({ where: { userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Add chat to blockedChats if not already blocked
      if (!user.blockedChats.includes(chatId)) {
        user.blockedChats.push(chatId);
        user.changed("blockedChats", true);
        await user.save();
      }
  
      console.log("✅ Chat blocked successfully:", chatId);
      return res.status(200).json({ message: "Chat blocked successfully", blockedChats: user.blockedChats });
    } catch (error) {
      console.error("❌ Error blocking chat:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
  
  export const unblockChat = async (req: MyRequest, res: Response) => {
    try {
      // ✅ Extract Authorization Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      // ✅ Extract user details
      const { userId } = decodedToken;
      const { chatId } = req.body;
  
      if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
      }
  
      // ✅ Find the user in the database
      const user = await User.findOne({ where: { userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Check if the chat is actually blocked
      if (!user.blockedChats.includes(chatId)) {
        return res.status(400).json({ message: "This chat is not blocked" });
      }
  
      // ✅ Remove the chat from blockedChats
      user.blockedChats = user.blockedChats.filter((id) => id !== chatId);
      user.changed("blockedChats", true);
      await user.save();
  
      console.log("✅ Chat unblocked successfully:", chatId);
      return res.status(200).json({ message: "Chat unblocked successfully", blockedChats: user.blockedChats });
    } catch (error) {
      console.error("❌ Error unblocking chat:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  