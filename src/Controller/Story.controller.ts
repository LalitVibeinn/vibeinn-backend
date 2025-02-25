// import { Request, Response } from 'express';
// import { IncomingForm } from 'formidable';  
// import { cloudinaryImageUploadMethod } from '../Utils/FileUpload.util';
// import Story from '../Models/Story.model';
// import { Op } from 'sequelize';  
// import jwt from "jsonwebtoken";
// import { MyRequest } from '@/Interfaces/Request.interface';

// // const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;

// export class StoryController {
//     constructor() {}

//     async create(request: MyRequest, response: Response) {
//         try {
//             // ✅ Extract JWT Token from the request headers
//             const authHeader = request.headers.authorization;
//             if (!authHeader || !authHeader.startsWith("Bearer ")) {
//                 return response.status(401).json({ message: "Missing or invalid token" });
//             }
    
//             const token = authHeader.split(" ")[1];
//             let decodedToken;
//             try {
//                 decodedToken = jwt.verify(token, process.env.CLERK_SECRET_KEY!);
//             } catch (err) {
//                 return response.status(401).json({ message: "Invalid or expired token" });
//             }

//             // ✅ Ensure username exists in the token
//             const username = (decodedToken as any).username;
//             if (!username) {
//                 return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
//             }
    
//             // ✅ Parse incoming form data
//             const form = new IncomingForm();
//             form.parse(request, async (error, fields, files) => {
//                 if (error) {
//                     console.error("Error parsing the form:", error);
//                     return response.status(500).json({ message: "Error processing form data" });
//                 }
    
//                 const text = fields.text ? String(fields.text) : ""; // ✅ Convert text field to string
//                 const filesArray = Object.values(files);
//                 if (!filesArray.length || !filesArray[0]) {
//                     return response.status(400).json({ message: "No file uploaded" });
//                 }
    
//                 const file = filesArray[0];
//                 if (Array.isArray(file)) {
//                     return response.status(400).json({ message: "Multiple files not supported" });
//                 }
    
//                 try {
//                     // ✅ Fix `file.path` -> `file.filepath` for Formidable v2+
//                     const mediaUrl = await cloudinaryImageUploadMethod(file.path);

//                     // ✅ Save the new Story to the database
//                     const newStory = await Story.create({
//                         owner: username,
//                         media: mediaUrl,
//                         text: text,
//                         createdAt: new Date(),
//                         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // ✅ 24-hour expiry
//                     });
    
//                     return response.status(201).json({ message: "Story added successfully", story: newStory });
//                 } catch (err) {
//                     console.error("Error creating the story:", err);
//                     return response.status(500).json({ message: "Failed to add story", error: err.message });
//                 }
//             });
//         } catch (error) {
//             console.error("Error in story creation:", error);
//             return response.status(500).json({ message: "Internal server error", error: error.message });
//         }
//     }

//     // ✅ Fetch only active stories (not expired)
//     async getAllStories(request: Request, response: Response): Promise<void> {
//         try {
//             const stories = await Story.findAll({
//                 where: {
//                     expiresAt: {
//                         [Op.gt]: new Date() // Fetch only non-expired stories
//                     }
//                 }
//             });
//             response.status(200).json(stories);
//         } catch (err) {
//             console.error('Error fetching stories:', err);
//             response.status(500).json({ message: 'Failed to fetch stories', error: err.message });
//         }
//     }

//     // ✅ Delete a story by ID
//     async deleteStory(request: Request, response: Response): Promise<void> {
//         const { id } = request.params;
//         try {
//             const story = await Story.findByPk(id);
//             if (story) {
//                 await story.destroy();
//                 response.status(200).json({ message: 'Story deleted successfully' });
//             } else {
//                 response.status(404).json({ message: 'Story not found' });
//             }
//         } catch (err) {
//             console.error('Error deleting the story:', err);
//             response.status(500).json({ message: 'Failed to delete story', error: err.message });
//         }
//     }
// }



import { Response } from "express";
import { IncomingForm, File } from "formidable";  
import { cloudinaryImageUploadMethod } from "../Utils/FileUpload.util";
import Story from "../Models/Story.model";
import User from "../Models/User.model";
import { Op } from "sequelize";  
import jwt from "jsonwebtoken";
import { MyRequest } from "../Interfaces/Request.interface";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;

export class StoryController {
    constructor() {}

    // ✅ Create a new story (Now includes `userId`)
    async create(request: MyRequest, response: Response) {
        try {
            // ✅ Extract JWT Token
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return response.status(401).json({ message: "Missing or invalid token" });
            }
    
            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                return response.status(401).json({ message: "Invalid or expired token" });
            }

            const username = (decodedToken as any).username;
            if (!username) {
                return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
            }

            // ✅ Get `userId` from DB
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            // ✅ Parse incoming form data
            const form = new IncomingForm();
            form.parse(request, async (error, fields, files) => {
                if (error) {
                    return response.status(500).json({ message: "Error processing form data" });
                }
    
                const text = fields.text ? String(fields.text) : ""; 
                const filesArray = Object.values(files);
                if (!filesArray.length || !filesArray[0]) {
                    return response.status(400).json({ message: "No file uploaded" });
                }
    
                const file = filesArray[0];
                if (Array.isArray(file)) {
                    return response.status(400).json({ message: "Multiple files not supported" });
                }
    
                try {
                    // ✅ Upload image
                    const mediaUrl = await cloudinaryImageUploadMethod(file.path);

                    // ✅ Save story to DB (Now includes `userId`)
                    const newStory = await Story.create({
                        userId: user.userId,  // ✅ Save `userId`
                        media: mediaUrl,
                        text: text,
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour expiry
                    });
    
                    return response.status(201).json({ message: "Story added successfully", story: newStory });
                } catch (err) {
                    return response.status(500).json({ message: "Failed to add story", error: err.message });
                }
            });
        } catch (error) {
            return response.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    // ✅ Fetch stories for a specific `userId`
    async getStoriesByUser(request: MyRequest, response: Response) {
        try {
            const { userId } = request.params;

            // ✅ Validate if user exists
            const user = await User.findOne({ where: { userId } });
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            // ✅ Get all non-expired stories for `userId`
            const stories = await Story.findAll({
                where: { userId, expiresAt: { [Op.gt]: new Date() } }
            });

            if (stories.length === 0) {
                return response.status(404).json({ message: "No active stories found for this user" });
            }

            return response.status(200).json(stories);
        } catch (error) {
            return response.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    // ✅ Fetch all active stories (for all users)
    async getAllStories(request: MyRequest, response: Response) {
        try {
            const stories = await Story.findAll({
                where: { expiresAt: { [Op.gt]: new Date() } }, // ✅ Only show non-expired stories
                include: [{ model: User, attributes: ["userId", "username", "fullname", "profile"] }] // ✅ Include user details
            });

            response.status(200).json(stories);
        } catch (error) {
            response.status(500).json({ message: "Failed to fetch stories", error: error.message });
        }
    }

    // ✅ Delete story by ID
    async deleteStory(request: MyRequest, response: Response) {
        try {
            const { id } = request.params;

            // ✅ Extract user info from token
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return response.status(401).json({ message: "Missing or invalid token" });
            }

            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                return response.status(401).json({ message: "Invalid or expired token" });
            }

            const username = decodedToken.username;
           
            if (!username) {
                return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
            }

            // ✅ Find story in DB
            const story = await Story.findByPk(id);
            if (!story) {
                return response.status(404).json({ message: "Story not found" });
            }

            // ✅ Ensure the user is the owner of the story
            const user = await User.findOne({ where: { username } });
            if (!user || story.userId !== user.userId) {
                return response.status(403).json({ message: "You are not authorized to delete this story" });
            }

            await story.destroy();
            return response.status(200).json({ message: "Story deleted successfully" });
        } catch (error) {
            return response.status(500).json({ message: "Failed to delete story", error: error.message });
        }
    }
}
