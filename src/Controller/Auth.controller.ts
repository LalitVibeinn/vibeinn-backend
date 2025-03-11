
//Controller/Auth.controller.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import User from "../Models/User.model";
import { MyRequest } from "../Interfaces/Request.interface";
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID generator

dotenv.config();

const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;
const ISSUER = "https://api.clerk.dev/v1";



// export const authenticateUser = async (request: MyRequest, response: Response, next: NextFunction) => {
//   try {
//     const authHeader = request.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return response.status(401).json({ message: "Missing or invalid token" });
//     }

//     const token = authHeader.split(" ")[1];

//     let decodedToken;
//     try {
//       decodedToken = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
//     } catch (err) {
//       return response.status(401).json({ message: "Invalid or expired token" });
//     }

//     const userId = decodedToken.userId; 
//     if (!userId) {
//       return response.status(401).json({ message: "Unauthorized: No user ID found in token" });
//     }

//     let clerkUser;
//     try {
//       clerkUser = await clerkClient.users.getUser(userId);
//     } catch (err) {
//       return response.status(500).json({ message: "Failed to fetch user from Clerk", error: err.message });
//     }

//     const firstName = clerkUser.firstName || "Unknown";
//     const lastName = clerkUser.lastName || "User";
//     let fullName = `${firstName}${lastName}`.trim(); // ✅ Remove spaces
//     fullName = fullName.toLowerCase(); // ✅ Convert to lowercase

//     const email = clerkUser.emailAddresses[0]?.emailAddress || null;
//     const phone = clerkUser.phoneNumbers[0]?.phoneNumber || null;

//     let existingUser = await User.findOne({ where: { clerkId: userId } });

//     if (!existingUser) {
//       console.log("🚀 Creating new user in PostgreSQL...");
//       existingUser = await User.create({
//         clerkId: userId,
//         username: fullName, // ✅ Store without spaces
//         email,
//         phone,
//         fullname: `${firstName} ${lastName}`, // Full name for display, username without spaces
//       });
//     } else {
//       if (!existingUser.username || existingUser.username !== fullName) {
//         existingUser.username = fullName;
//         await existingUser.save();
//       }
//     }

//     request.token = {
//       userId: existingUser.userId,
//       username: existingUser.username,
//       email: existingUser.email,
//       phone: existingUser.phone,
//       fullname: existingUser.fullname,
//       firstName,
//       lastName,
//     };

//     next();
//   } catch (error) {
//     console.error("❌ Authentication Error:", error);
//     return response.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// ✅ Global cache to store verified users temporarily (reduces repeated queries)
const authCache = new Map<string, any>();

export const authenticateUser = async (request: MyRequest, response: Response, next: NextFunction) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Check cache first to avoid unnecessary verification
    if (authCache.has(token)) {
      request.token = authCache.get(token);
      return next();
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    } catch (err) {
      return response.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decodedToken.userId;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized: No user ID found in token" });
    }

    // ✅ Check if the user is already cached
    if (authCache.has(userId)) {
      request.token = authCache.get(userId);
      return next();
    }

    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(userId);
    } catch (err) {
      return response.status(500).json({ message: "Failed to fetch user from Clerk", error: err.message });
    }

    const firstName = clerkUser.firstName?.trim() || "Unknown";
    const lastName = clerkUser.lastName?.trim() || "User";
    const fullName = `${firstName}${lastName}`.toLowerCase(); // ✅ Store in lowercase without spaces
    const email = clerkUser.emailAddresses[0]?.emailAddress || null;
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber || null;

    let existingUser = await User.findOne({ where: { clerkId: userId } });

    if (!existingUser) {
      console.log("🚀 Creating new user in PostgreSQL...");
      existingUser = await User.create({
        clerkId: userId,
        username: fullName,
        email,
        phone,
        fullname: `${firstName} ${lastName}`, // ✅ Full name for display, username stored without spaces
      });
    } else {
      if (!existingUser.username || existingUser.username !== fullName) {
        existingUser.username = fullName;
        await existingUser.save();
      }
    }

    // ✅ Store authenticated user in cache for faster access
    const userTokenData = {
      userId: existingUser.userId,
      username: existingUser.username,
      email: existingUser.email,
      phone: existingUser.phone,
      fullname: existingUser.fullname,
      firstName,
      lastName,
    };

    authCache.set(token, userTokenData);
    authCache.set(userId, userTokenData); // ✅ Cache user details too

    request.token = userTokenData;
    next();
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    return response.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const generateJwt = async (req: MyRequest, res: Response) => {
  try {
    console.log("🔹 Incoming request body:", req.body);

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    let existingUser = await User.findOne({ where: { clerkId } });

    if (!existingUser) {
      console.log(`❌ User with clerkId: ${clerkId} not found. Creating new user...`);
      const generatedUsername = `user_${Math.floor(1000 + Math.random() * 9000)}`;

      existingUser = await User.create({
        clerkId,
        username: generatedUsername.replace(/\s+/g, "").toLowerCase(), // ✅ Remove spaces & lowercase
        userId: uuidv4(),
      });
    }  

    const payload = {
      userId: existingUser.userId,
      username: existingUser.username,
      clerkId: existingUser.clerkId,
      phone: existingUser.phone,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    };

    const token = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });

    return res.status(200).json({ jwt: token });
  } catch (error) {
    console.error("❌ Error generating JWT:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

