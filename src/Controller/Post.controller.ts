
///Controller/post.controller.ts
import { Response } from "express";
import { File, IncomingForm } from "formidable";
import jwt from "jsonwebtoken";
import { MyRequest } from "../Interfaces/Request.interface";
import Post from "../Models/Post.model";
import { cloudinaryImageUploadMethod } from "../Utils/FileUpload.util";
import User from "../Models/User.model";
import dotenv from "dotenv";
import { Op } from "sequelize"; // ✅ Import Op for case-insensitive search
import { QueryTypes } from "sequelize"; // ✅ Import QueryTypes for raw SQL
import { calculateUserRank } from "../Utils/VibeRank.util";
import { Sequelize } from "sequelize-typescript";
import { sendNotification } from "../Utils/Notification.util"; // Import the function



dotenv.config();

const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;




// export const updateVibeScore = async (
//     userId: string, 
//     incrementScore: number, 
//     action: "post" | "comment" | "chat" | "like" | "milestone"
// ) => {
//     console.log(`🔹 updateVibeScore called for userId: ${userId} with incrementScore: ${incrementScore} for action: ${action}`);

//     const user = await User.findOne({ where: { userId } });
//     if (!user) {
//         console.log(`❌ User not found in updateVibeScore for userId: ${userId}`);
//         return;
//     }

//     const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

//     // ✅ Ensure `dailyVibePoints` is an object
//     if (!user.dailyVibePoints || typeof user.dailyVibePoints !== "object") {
//         user.dailyVibePoints = {};
//     }

//     // ✅ Reset daily points if it's a new day
//     if (user.lastVibeUpdate !== today) {
//         console.log(`🔄 Resetting dailyVibePoints for ${user.username}`);
//         user.dailyVibePoints = { 
//             post: 0, 
//             comment: 0, 
//             chat: 0, 
//             like: 0, 
//             remainingLimit: 50 // ✅ Reset daily limit to 50
//         };
//         user.lastVibeUpdate = today;
//     }

//     // ✅ Get remaining daily limit
//     let remainingDailyLimit = user.dailyVibePoints.remainingLimit || 0;

//     // ✅ If no daily limit left, prevent VibeScore increase
//     if (remainingDailyLimit <= 0) {
//         console.log(`⚠️ Daily limit reached for ${user.username}. Action allowed, but VibeScore NOT increased.`);
//         return;
//     }

//     let newPoints = incrementScore;

//     // ✅ Special handling for comments (1 point for every 5 comments)
//     if (action === "comment") {
//         let commentCount = user.dailyVibePoints.comment || 0;

//         // ✅ Increase comment count
//         commentCount += 1;
//         user.dailyVibePoints.comment = commentCount;

//         console.log(`📝 ${user.username} has commented ${commentCount} times today.`);

//         // ✅ Award 1 VibeScore for every 5 comments
//         if (commentCount % 5 === 0) {
//             newPoints = 1; // ✅ Increase VibeScore by 1 for every 5 comments

//             // ✅ Deduct from daily limit
//             user.dailyVibePoints.remainingLimit -= newPoints;

//             console.log(`🔥 ${user.username} reached ${commentCount} comments. Awarding ${newPoints} VibeScore.`);
//         } else {
//             // ✅ Save comment count without adding VibeScore
//             await User.update(
//                 { dailyVibePoints: user.dailyVibePoints },
//                 { where: { userId } }
//             );
//             console.log(`📝 ${user.username} commented (${commentCount} total today). VibeScore increases every 5 comments.`);
//             return; // ✅ Don't add to VibeScore yet
//         }
//     } else {
//         // ✅ For actions other than comments, reduce limit normally
//         newPoints = Math.min(remainingDailyLimit, newPoints);
//         user.dailyVibePoints.remainingLimit -= newPoints;
//     }

//     // ✅ Increase action-specific count
//     user.dailyVibePoints[action] = (user.dailyVibePoints[action] || 0) + 1;

//     // ✅ Increase user's total VibeScore
//     user.vibeScore += newPoints;
//     user.rank = calculateUserRank(user.vibeScore);

//     // ✅ 🔥 Explicitly update the JSONB field in PostgreSQL
//     await User.update(
//         { 
//             dailyVibePoints: user.dailyVibePoints, 
//             vibeScore: user.vibeScore, 
//             lastVibeUpdate: today 
//         },
//         { where: { userId } }
//     );

//     console.log(`✅ Updated VibeScore for ${user.username}: ${user.vibeScore} (+${newPoints} points). Remaining limit: ${user.dailyVibePoints.remainingLimit}`);
// };


export const updateVibeScore = async (
    userId: string, 
    incrementScore: number, 
    action: "post" | "comment" | "chat" | "like" | "milestone"
) => {
    console.log(`🔹 updateVibeScore called for userId: ${userId} with incrementScore: ${incrementScore} for action: ${action}`);

    const user = await User.findOne({ where: { userId } });
    if (!user) {
        console.log(`❌ User not found in updateVibeScore for userId: ${userId}`);
        return;
    }

    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // ✅ Ensure `dailyVibePoints` is an object
    if (!user.dailyVibePoints || typeof user.dailyVibePoints !== "object") {
        user.dailyVibePoints = {};
    }

    // ✅ Reset daily points if it's a new day
    if (user.lastVibeUpdate !== today) {
        console.log(`🔄 Resetting dailyVibePoints for ${user.username}`);
        user.dailyVibePoints = { 
            post: 0, 
            comment: 0, 
            chat: 0, 
            like: 0, 
            remainingLimit: 50 // ✅ Reset daily limit to 50
        };
        user.lastVibeUpdate = today;
    }

    // ✅ Get remaining daily limit
    let remainingDailyLimit = user.dailyVibePoints.remainingLimit || 0;

    // ✅ If no daily limit left, prevent VibeScore increase
    if (remainingDailyLimit <= 0) {
        console.log(`⚠️ Daily limit reached for ${user.username}. Action allowed, but VibeScore NOT increased.`);
        return;
    }

    let newPoints = incrementScore;

    // ✅ Special handling for comments (1 point for every 5 comments)
    if (action === "comment") {
        let commentCount = user.dailyVibePoints.comment || 0;

        // ✅ Increase comment count
        commentCount += 1;
        user.dailyVibePoints.comment = commentCount;

        console.log(`📝 ${user.username} has commented ${commentCount} times today.`);

        // ✅ Award 1 VibeScore for every 5 comments
        if (commentCount % 5 === 0) {
            newPoints = 1; // ✅ Increase VibeScore by 1 for every 5 comments

            // ✅ Deduct from daily limit
            user.dailyVibePoints.remainingLimit -= newPoints;

            console.log(`🔥 ${user.username} reached ${commentCount} comments. Awarding ${newPoints} VibeScore.`);
        } else {
            // ✅ Save updated comment count in database
            await User.update(
                { dailyVibePoints: user.dailyVibePoints },
                { where: { userId } }
            );
            console.log(`📝 ${user.username} commented (${commentCount} total today). VibeScore increases every 5 comments.`);
            return; // ✅ Don't add to VibeScore yet
        }
    } else {
        // ✅ For actions other than comments, reduce limit normally
        newPoints = Math.min(remainingDailyLimit, newPoints);
        user.dailyVibePoints.remainingLimit -= newPoints;
    }

    // ✅ Ensure action count is incremented correctly
    user.dailyVibePoints[action] = (user.dailyVibePoints[action] || 0) + 1;

    // ✅ Increase user's total VibeScore
    user.vibeScore += newPoints;
    user.rank = calculateUserRank(user.vibeScore);

    // ✅ Explicitly update the JSONB field in PostgreSQL
    await User.update(
        { 
            dailyVibePoints: user.dailyVibePoints, 
            vibeScore: user.vibeScore, 
            lastVibeUpdate: today 
        },
        { where: { userId } }
    );

    console.log(`✅ Updated VibeScore for ${user.username}: ${user.vibeScore} (+${newPoints} points). Remaining limit: ${user.dailyVibePoints.remainingLimit}`);
};


// export const updateVibeScore = async (
//     userId: string, 
//     incrementScore: number, 
//     action: "post" | "comment" | "chat" | "like" | "milestone"
// ) => {
//     console.log(`🔹 updateVibeScore called for userId: ${userId} with incrementScore: ${incrementScore} for action: ${action}`);

//     const user = await User.findOne({ where: { userId } });
//     if (!user) {
//         console.log(`❌ User not found in updateVibeScore for userId: ${userId}`);
//         return;
//     }

//     const today = new Date().toISOString().split("T")[0];

//     // ✅ Ensure `dailyVibePoints` is an object
//     if (!user.dailyVibePoints || typeof user.dailyVibePoints !== "object") {
//         user.dailyVibePoints = { post: 0, comment: 0, chat: 0, like: 0, remainingLimit: 50 };
//     }

//     // ✅ Reset daily points if it's a new day
//     if (user.lastVibeUpdate !== today) {
//         console.log(`🔄 Resetting dailyVibePoints for ${user.username}`);
//         user.dailyVibePoints = { post: 0, comment: 0, chat: 0, like: 0, remainingLimit: 50 };
//         user.lastVibeUpdate = today;
//     }

//     // ✅ Get remaining daily limit
//     let remainingDailyLimit = user.dailyVibePoints.remainingLimit || 0;
//     if (remainingDailyLimit <= 0) {
//         console.log(`⚠️ ${user.username} has reached the daily limit. VibeScore not increased.`);
//         return;
//     }

//     // ✅ Special handling for comments
//     if (action === "comment") {
//         let commentCount = user.dailyVibePoints.comment || 0;
//         commentCount += 1;
//         user.dailyVibePoints.comment = commentCount;

//         console.log(`📝 ${user.username} has commented ${commentCount} times today.`);

//         // ✅ Only award VibeScore every 5 comments
//         if (commentCount % 5 === 0) {
//             incrementScore = 1;
//         } else {
//             await User.update({ dailyVibePoints: user.dailyVibePoints }, { where: { userId } });
//             return;
//         }
//     }

//     // ✅ Deduct from daily limit
//     incrementScore = Math.min(remainingDailyLimit, incrementScore);
//     user.dailyVibePoints.remainingLimit -= incrementScore;

//     // ✅ Increase VibeScore
//     user.vibeScore += incrementScore;
//     user.rank = calculateUserRank(user.vibeScore);

//     // ✅ Save updated values
//     await User.update(
//         { dailyVibePoints: user.dailyVibePoints, vibeScore: user.vibeScore, lastVibeUpdate: today },
//         { where: { userId } }
//     );

//     console.log(`✅ Updated VibeScore for ${user.username}: ${user.vibeScore} (+${incrementScore} points). Remaining limit: ${user.dailyVibePoints.remainingLimit}`);
// };

const checkLikeMilestone = async (user: User, postId: string) => {
    const post = await Post.findByPk(postId);
    if (!post) {
        console.log(`❌ Post not found in checkLikeMilestone for postId: ${postId}`);
        return;
    }

    const likeMilestones: Record<number, number> = {
        100: 10,
        500: 20,
        1000: 50,
        5000: 100,
        10000: 200,
        500000: 500
    };

    const currentLikes = Array.isArray(post.likes) ? post.likes.length : 0;
    let milestonePoints = 0;

    for (const milestone of Object.keys(likeMilestones).map(Number)) {
        if (currentLikes === milestone) {
            milestonePoints = likeMilestones[milestone];
            break;
        }
    }

    if (milestonePoints > 0) {
        console.log(`🎉 Post ${postId} reached ${currentLikes} likes! Awarding ${milestonePoints} points to ${user.username}`);

        user.vibeScore += milestonePoints;
        user.rank = calculateUserRank(user.vibeScore);

        await user.save();

        console.log(`✅ Milestone points added: ${milestonePoints} for ${user.username}`);
    }
};




export class PostController {


// async create(request: MyRequest, response: Response) {
//     try {
//         const form = new IncomingForm();
//         form.parse(request, async (error, fields, files) => {
//             if (error) {
//                 return response.status(500).json({ message: 'Network Error: Failed to upload post' });
//             }

//             // ✅ Validate Authorization Token
//             const authHeader = request.headers.authorization;
//             if (!authHeader || !authHeader.startsWith("Bearer ")) {
//                 return response.status(401).json({ message: "Missing or invalid token" });
//             }

//             const token = authHeader.split(" ")[1];
//             let decodedToken;
//             try {
//                 decodedToken = jwt.verify(token, SECRET_KEY);
//             } catch (err) {
//                 return response.status(401).json({ message: "Invalid or expired token" });
//             }

//             const username = decodedToken.username;
//             const userId = decodedToken.userId;

//             if (!username) {
//                 return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
//             }

//             // ✅ Find the User
//             const user = await User.findOne({ where: { username } });
//             if (!user) {
//                 return response.status(404).json({ message: "User not found" });
//             }

//             // ✅ Determine Post Category
//             let postCategory = fields.post_category ? String(fields.post_category).trim().toLowerCase() : "general";
//             const validCategories = ["sports", "entertainment", "technology", "news", "education", "general"];
//             if (!validCategories.includes(postCategory)) {
//                 postCategory = "general";
//             }

//             // ✅ Handle Media Uploads
//             const media_urls: string[] = [];
//             for (const [, file] of Object.entries(files as { [key: string]: File })) {
//                 const file_url = await cloudinaryImageUploadMethod(file.path);
//                 media_urls.push(file_url);
//             }
//             const displayAuthor = user.isAnonymous ? user.anonymousName || "Anonymous" : username;
//             const profilePic = user.isAnonymous ? user.anonymousProfile : user.profile;
//             // ✅ Create the Post
//             const post = await Post.create({
//                 media: media_urls,
//                 caption: fields.caption ? String(fields.caption) : "",
//                 author: username,
//                 displayAuthor, // ✅ Store static display name
//                 profilePic, // ✅ Store static profile picture
//                 visibility: fields.visibility || "everyone",
//                 post_category: postCategory,
//                 likes: [],
//                 comments: [],
//                 views: 0,
//                 viewedUsers: []
//             });

//             console.log("📢 Post Created with Category:", post.post_category);

//             // ✅ Update post count
//             user.postCount += 1;
//             await user.save();

//             // ✅ Award VibeScore for posting
//             const points = postCategory === "general" ? 3 : 5;
//             await updateVibeScore(userId, points, "post");

//             return response.status(201).json({
//                 message: 'Post created successfully',
//                 postDetails: {
//                     postId: post.id,
//                     media: post.media,
//                     caption: post.caption,
//                     author: post.author,
//                     displayAuthor: post.displayAuthor,
//                     visibility: post.visibility,
//                     post_category: post.post_category,
//                     createdAt: post.createdAt,
//                     userId: user.userId,
//                     likes: post.likes,
//                     comments: post.comments,
//                     views: post.views
//                 },
//             });
//         });
//     } catch (error) {
//         console.error("❌ Error creating post:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }

async create(request: MyRequest, response: Response) {
    try {
        const form = new IncomingForm();
        form.parse(request, async (error, fields, files) => {
            if (error) {
                return response.status(500).json({ message: 'Network Error: Failed to upload post' });
            }

            // ✅ Validate Authorization Token
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
            const userId = decodedToken.userId;

            if (!username) {
                return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
            }

            // ✅ Find the User
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            // ✅ Capture anonymity details at the time of post creation
            const displayAuthor = user.isAnonymous ? user.anonymousName || "Anonymous" : username;
            const profilePic = user.isAnonymous ? user.anonymousProfile : user.profile;

            let postCategory = fields.post_category ? String(fields.post_category).trim().toLowerCase() : "general";
            const validCategories = ["sports", "entertainment", "technology", "news", "education", "general"];
            if (!validCategories.includes(postCategory)) {
                postCategory = "general";
            }

            // ✅ Handle Media Uploads
            const media_urls: string[] = [];
            for (const [, file] of Object.entries(files as { [key: string]: File })) {
                const file_url = await cloudinaryImageUploadMethod(file.path);
                media_urls.push(file_url);
            }

            // ✅ Create the Post
            const post = await Post.create({
                media: media_urls,
                caption: fields.caption ? String(fields.caption) : "",
                author: username,
                displayAuthor, // ✅ Store static display name
                profilePic, // ✅ Store static profile picture
                visibility: fields.visibility || "everyone",
                post_category: postCategory,
                likes: [],
                comments: [],
                views: 0,
                viewedUsers: []
            });

            console.log("📢 Post Created with Category:", post.post_category);

            user.postCount += 1;
            await user.save();

            // ✅ Award VibeScore for posting
            const points = postCategory === "general" ? 3 : 5;
            await updateVibeScore(userId, points, "post");

            return response.status(201).json({
                message: 'Post created successfully',
                postDetails: post
            });
        });
    } catch (error) {
        console.error("❌ Error creating post:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}



  async deletePost(request: MyRequest, response: Response){
    try {
      // ✅ Extract JWT Token from Authorization Header
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
  
      // ✅ Extract username from the token
      const username = decodedToken.username;
      if (!username) {
        return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
      }
  
      // ✅ Extract Post ID from the request parameters
      const { id } = request.params;
      if (!id) {
        return response.status(400).json({ message: "Post ID is required" });
      }
  
      // ✅ Find the post in the database
      const post = await Post.findByPk(id);
      if (!post) {
        return response.status(404).json({ message: "Post not found" });
      }
  
      // ✅ Ensure the user is the author of the post
      if (post.author !== username) {
        return response.status(403).json({ message: "You are not authorized to delete this post" });
      }
  
      // ✅ Delete the post
      await post.destroy();
  
      // ✅ Decrease the user's post count
      const user = await User.findOne({ where: { username } });
      if (user && user.postCount > 0) {
        user.postCount -= 1;
        await user.save();
      }
  
      return response.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      return response.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
  


// async getPosts(request: MyRequest, response: Response) {
//     try {
//         // ✅ Validate Authorization Header
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         // ✅ Verify JWT Token
//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         // ✅ Extract Logged-in Username
//         const username = decodedToken.username;
//         if (!username) {
//             return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
//         }

//         // ✅ Fetch the logged-in user
//         const currentUser = await User.findOne({ where: { username } });
//         if (!currentUser) {
//             return response.status(404).json({ message: "User not found" });
//         }

//         // ✅ Get the list of users the current user follows
//         const following = currentUser.following || [];

//         // ✅ Read pagination parameters and convert them to numbers
//         const page = parseInt(request.query.page as string) || 1;
//         const limit = parseInt(request.query.limit as string) || 10;
//         const offset = (page - 1) * limit;

//         // ✅ Fetch total post count (for pagination)
//         const totalPosts = await Post.count();

//         // ✅ Fetch paginated posts
//         const posts = await Post.findAll({
//             include: [{
//                 model: User,
//                 attributes: ['userId', 'username', 'fullname', 'profile', 'isAnonymous', 'anonymousProfile', 'anonymousName']
//             }],
//             attributes: [
//                 'id', 'media', 'caption', 'author', 'displayAuthor', 'likes', 
//                 'comments', 'visibility', 'post_category', 'views', 'createdAt', 'updatedAt'
//             ],
//             order: [['createdAt', 'DESC']], 
//             limit: limit,  
//             offset: offset  
//         });

//         // ✅ Process posts efficiently
//         const processedPosts = await Promise.all(posts.map(async (post) => {
//             const postData = post.toJSON();

//             // ✅ Fetch user details for the author
//             const postAuthor = await User.findOne({
//                 where: { username: postData.author },
//                 attributes: ['userId', 'username', 'isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
//             });

//             // ✅ Ensure likes is always an array before mapping
//             const likedUsers = Array.isArray(postData.likes) ? postData.likes.map(like => ({
//                 username: like.username,
//                 displayAuthor: like.displayAuthor,
//                 profilePic: like.profilePic
//             })) : [];

//             // ✅ Ensure comments is always an array before mapping
//             const processedComments = Array.isArray(postData.comments) ? 
//                 await Promise.all(postData.comments.map(async (comment) => {
//                     const commentAuthor = await User.findOne({
//                         where: { username: comment.username },
//                         attributes: ['isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
//                     });

//                     return {
//                         ...comment,
//                         displayAuthor: commentAuthor?.isAnonymous ? commentAuthor?.anonymousName || "Anonymous" : comment.username,
//                         profilePic: commentAuthor?.isAnonymous ? commentAuthor?.anonymousProfile : commentAuthor?.profile,
//                         replies: Array.isArray(comment.replies) ? await Promise.all(comment.replies.map(async (reply) => {
//                             const replyAuthor = await User.findOne({
//                                 where: { username: reply.username },
//                                 attributes: ['isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
//                             });

//                             return {
//                                 ...reply,
//                                 displayAuthor: replyAuthor?.isAnonymous ? replyAuthor?.anonymousName || "Anonymous" : reply.username,
//                                 profilePic: replyAuthor?.isAnonymous ? replyAuthor?.anonymousProfile : replyAuthor?.profile,
//                             };
//                         })) : []
//                     };
//                 })) : [];

//             return {
//                 ...postData,
//                 totalLikes: likedUsers.length,
//                 likedBy: likedUsers,
//                 userId: postAuthor?.userId,
//                 displayAuthor: postAuthor?.isAnonymous ? (postAuthor?.anonymousName || "Anonymous") : postAuthor?.username,
//                 profilePic: postAuthor?.isAnonymous ? postAuthor?.anonymousProfile : postAuthor?.profile,
//                 comments: processedComments
//             };
//         }));

//         // ✅ Apply visibility filters
//         const finalPosts = processedPosts.filter(post => {
//             switch (post.visibility) {
//                 case 'friends':
//                     return following.includes(post.author); 
//                 case 'except_friends':
//                     return !following.includes(post.author);
//                 case 'everyone':
//                     return true;
//                 default:
//                     return false;
//             }
//         });

//         // ✅ Send the response
//         return response.status(200).json({
//             message: "Posts retrieved successfully",
//             posts: finalPosts,
//             currentPage: page,
//             totalPages: Math.ceil(totalPosts / limit),
//             totalPosts: totalPosts
//         });

//     } catch (error) {
//         console.error("❌ Error fetching posts:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }





// async like(request: MyRequest, response: Response) {
//     try {
//         const { id } = request.params;

//         // ✅ Validate Authorization Token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         const userId = decodedToken.userId;
//         const username = decodedToken.username;

//         // ✅ Find User
//         const user = await User.findOne({ where: { userId } });
//         if (!user) {
//             return response.status(404).json({ message: "User not found" });
//         }

//         // ✅ Find Post
//         const post = await Post.findByPk(id);
//         if (!post) {
//             return response.status(404).json({ message: "Post not found" });
//         }

//         let likes = Array.isArray(post.likes) ? [...post.likes] : [];
//         const alreadyLiked = likes.some(like => like.username === username);

//         if (!alreadyLiked) {
//             const newLike = {
//                 username,
//                 displayAuthor: user.isAnonymous ? user.anonymousName : username,
//                 profilePic: user.isAnonymous ? user.anonymousProfile : user.profile
//             };

//             likes.push(newLike);
//             await post.update({ likes });

//             console.log(`📢 ${user.username} liked post ${post.id}`);

//             // ✅ Award VibeScore for liking
//             await updateVibeScore(userId, 1, "like");

//             // ✅ Check for milestone rewards
//             await checkLikeMilestone(user, post.id.toString());

//             return response.status(200).json({
//                 message: "Liked post successfully",
//                 totalLikes: likes.length,
//                 likedBy: likes
//             });
//         } else {
//             return response.status(400).json({ message: "Already liked" });
//         }
//     } catch (error) {
//         console.error("❌ Error liking post:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }
async getPosts(request: MyRequest, response: Response) {
    try {
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

        const currentUser = await User.findOne({ where: { username } });
        if (!currentUser) {
            return response.status(404).json({ message: "User not found" });
        }

        const following = currentUser.following || [];

        const page = parseInt(request.query.page as string) || 1;
        const limit = parseInt(request.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // ✅ Optimize using `findAndCountAll()`
        const { count, rows: posts } = await Post.findAndCountAll({
            attributes: [
                'id',
                'media',
                'caption',
                'author',
                'displayAuthor',
                'likes',
                'comments',
                'visibility',
                'post_category',
                'views',
                'created_at',
                'updated_at'
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        // ✅ Process posts efficiently
        const processedPosts = await Promise.all(posts.map(async (post) => {
            const postData = post.toJSON();

            // Ensure anonymity is preserved for likes
            const likedBy = Array.isArray(postData.likes)
                ? postData.likes.map(like => ({
                    username: like.username,
                    displayAuthor: like.displayAuthor,
                    profilePic: like.profilePic
                }))
                : [];

            // Ensure anonymity is preserved for comments
            const processedComments = Array.isArray(postData.comments)
                ? await Promise.all(postData.comments.map(async (comment) => ({
                    ...comment,
                    displayAuthor: comment.displayAuthor,
                    profilePic: comment.profilePic,
                    replies: Array.isArray(comment.replies)
                        ? comment.replies.map(reply => ({
                            ...reply,
                            displayAuthor: reply.displayAuthor,
                            profilePic: reply.profilePic
                        }))
                        : []
                })))
                : [];

            return {
                ...postData,
                totalLikes: likedBy.length,
                likedBy,
                comments: processedComments
            };
        }));

        // ✅ Apply visibility filters
        const finalPosts = processedPosts.filter(post => {
            switch (post.visibility) {
                case 'friends':
                    return following.includes(post.author);
                case 'except_friends':
                    return !following.includes(post.author);
                case 'everyone':
                    return true;
                default:
                    return false;
            }
        });

        return response.status(200).json({
            message: "Posts retrieved successfully",
            posts: finalPosts,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalPosts: count
        });

    } catch (error) {
        console.error("❌ Error fetching posts:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}




// async like(request: MyRequest, response: Response) {
//     try {
//         const { id } = request.params;

//         // ✅ Validate Authorization Token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         const userId = decodedToken.userId;
//         const username = decodedToken.username;

//         // ✅ Find User
//         const user = await User.findOne({ where: { userId } });
//         if (!user) {
//             return response.status(404).json({ message: "User not found" });
//         }

//         // ✅ Find Post
//         const post = await Post.findByPk(id);
//         if (!post) {
//             return response.status(404).json({ message: "Post not found" });
//         }

//         let likes = Array.isArray(post.likes) ? [...post.likes] : [];
//         const alreadyLiked = likes.some(like => like.username === username);

//         if (!alreadyLiked) {
//             const newLike = {
//                 username,
//                 displayAuthor: user.isAnonymous ? user.anonymousName : username, // ✅ Store static value
//                 profilePic: user.isAnonymous ? user.anonymousProfile : user.profile // ✅ Store static value
//             };

//             likes.push(newLike);
//             await post.update({ likes });

//             console.log(`📢 ${user.username} liked post ${post.id}`);

//             // ✅ Award VibeScore for liking
//             await updateVibeScore(userId, 1, "like");

//             return response.status(200).json({
//                 message: "Liked post successfully",
//                 totalLikes: likes.length,
//                 likedBy: likes
//             });
//         } else {
//             return response.status(400).json({ message: "Already liked" });
//         }
//     } catch (error) {
//         console.error("❌ Error liking post:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }






// async unlike(request: MyRequest, response: Response) {
//     try {
//         const { id } = request.params;
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         const username = decodedToken.username;
//         if (!username) {
//             return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
//         }

//         const post = await Post.findByPk(id);
//         if (!post) {
//             return response.status(404).json({ message: "Post not found" });
//         }

//         let likes = post.likes || [];

//         // ✅ Remove only the like associated with the user's username
//         likes = likes.filter(like => like.username !== username);

//         await post.update({ likes });

//         return response.status(200).json({ 
//             message: "Unliked post successfully",
//             totalLikes: likes.length,
//             likedBy: likes
//         });
//     } catch (error) {
//         console.error("❌ Error unliking post:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }



// async comment(request: MyRequest, response: Response) {
//     try {
//         // ✅ Validate Authorization Token
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         const userId = decodedToken.userId;
//         const username = decodedToken.username;
//         const { id } = request.params;
//         const { comment } = request.body;

//         if (!comment) {
//             return response.status(400).json({ message: "Comment cannot be empty" });
//         }

//         // ✅ Find Post
//         const post = await Post.findByPk(id);
//         if (!post) {
//             return response.status(404).json({ message: "Post not found" });
//         }

//         // ✅ Find User
//         const user = await User.findOne({ where: { userId } });
//         if (!user) {
//             return response.status(404).json({ message: "User not found" });
//         }

//         let comments = Array.isArray(post.comments) ? post.comments : [];
//         const newComment = {
//             username,
//             displayAuthor: user.isAnonymous ? user.anonymousName || "Anonymous" : username,
//             profilePic: user.isAnonymous ? user.anonymousProfile : user.profile,
//             comment,
//             createdAt: new Date().toISOString(),
//             replies: []
//         };

//         comments.push(newComment);
//         await post.update({ comments });

//         console.log(`📝 ${user.username} commented on post ${post.id}`);

//         // ✅ Ensure `dailyVibePoints` is an object
//         if (!user.dailyVibePoints || typeof user.dailyVibePoints !== "object") {
//             user.dailyVibePoints = { comment: 0, remainingLimit: 50 };
//         }

//         // ✅ Reset daily comment count if it's a new day
//         const today = new Date().toISOString().split("T")[0];
//         if (user.lastVibeUpdate !== today) {
//             console.log(`🔄 Resetting daily comment count for ${user.username}`);
//             user.dailyVibePoints.comment = 0;
//             user.dailyVibePoints.remainingLimit = 50; // ✅ Reset daily limit
//             user.lastVibeUpdate = today;
//         }

//         // ✅ Increment daily comment count
//         user.dailyVibePoints.comment += 1;
//         console.log(`📝 ${user.username} has commented ${user.dailyVibePoints.comment} times today.`);

//         // ✅ Check if it's the 5th comment to award VibeScore
//         if (user.dailyVibePoints.comment % 5 === 0) {
//             console.log(`🔥 ${user.username} reached ${user.dailyVibePoints.comment} comments. Awarding 1 VibeScore.`);

//             await updateVibeScore(userId, 1, "comment"); // ✅ Increase VibeScore and deduct limit inside function
//         }

//         // ✅ Explicitly save dailyVibePoints
//         user.set("dailyVibePoints", user.dailyVibePoints);
//         await user.save();

//         return response.status(200).json({ message: "Comment added successfully", comments });
//     } catch (error) {
//         console.error("❌ Error adding comment:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }

async like(request: MyRequest, response: Response) {
    try {
        const { id } = request.params;

        // ✅ Validate Authorization Token
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

        const userId = decodedToken.userId;

        // ✅ Find User by `userId`
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // ✅ Find Post
        const post = await Post.findByPk(id);
        if (!post) {
            return response.status(404).json({ message: "Post not found" });
        }

        let likes = Array.isArray(post.likes) ? [...post.likes] : [];
        const alreadyLiked = likes.some(like => like.userId === userId);

        if (!alreadyLiked) {
            const newLike = {
                userId, // ✅ Store userId
                username: user.username, 
                displayAuthor: user.isAnonymous ? user.anonymousName : user.username, 
                profilePic: user.isAnonymous ? user.anonymousProfile : user.profile
            };

            likes.push(newLike);
            await post.update({ likes });

            console.log(`📢 ${user.username} liked post ${post.id}`);

            // ✅ Award VibeScore for liking
            await updateVibeScore(userId, 1, "like");

            return response.status(200).json({
                message: "Liked post successfully",
                totalLikes: likes.length,
                likedBy: likes
            });
        } else {
            return response.status(400).json({ message: "Already liked" });
        }
    } catch (error) {
        console.error("❌ Error liking post:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}


async unlike(request: MyRequest, response: Response) {
    try {
        const { id } = request.params;
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

        const userId = decodedToken.userId;

        // ✅ Find User by `userId`
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // ✅ Find Post
        const post = await Post.findByPk(id);
        if (!post) {
            return response.status(404).json({ message: "Post not found" });
        }

        let likes = Array.isArray(post.likes) ? [...post.likes] : [];

        // ✅ Remove like using `userId`
        const updatedLikes = likes.filter(like => like.userId !== userId);

        if (likes.length === updatedLikes.length) {
            return response.status(400).json({ message: "Like not found" });
        }

        await post.update({ likes: updatedLikes });

        return response.status(200).json({
            message: "Unliked post successfully",
            totalLikes: updatedLikes.length,
            likedBy: updatedLikes
        });
    } catch (error) {
        console.error("❌ Error unliking post:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}


async comment(request: MyRequest, response: Response) {
    try {
        // ✅ Validate Authorization Token
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

        const userId = decodedToken.userId;
        const username = decodedToken.username;
        const { id } = request.params; // ✅ Post ID
        const { comment } = request.body; // ✅ Extract comment text

        if (!comment) {
            return response.status(400).json({ message: "Comment cannot be empty" });
        }

        // ✅ Find the post
        const post = await Post.findByPk(id);
        if (!post) {
            return response.status(404).json({ message: "Post not found" });
        }

        // ✅ Find the user
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // ✅ Ensure `post.comments` is an array (Fix JSONB issue)
        let commentsArray = Array.isArray(post.comments) ? post.comments : [];

        // ✅ Create new comment object
        const newComment = {
            username,
            displayAuthor: user.isAnonymous ? user.anonymousName || "Anonymous" : username,
            profilePic: user.isAnonymous ? user.anonymousProfile : user.profile,
            comment,
            createdAt: new Date().toISOString(),
            replies: [] // ✅ Ensure replies is an array
        };

        // ✅ Push the new comment
        commentsArray.push(newComment);

        // ✅ Update post in database
        await Post.update(
            { comments: commentsArray }, // ✅ Update JSONB column
            { where: { id: post.id } }
        );

        console.log(`📝 ${user.username} commented on post ${post.id}`);

        // ✅ Award VibeScore for commenting
        await updateVibeScore(userId, 1, "comment");

        return response.status(200).json({ message: "Comment added successfully", comments: commentsArray });
    } catch (error) {
        console.error("❌ Error adding comment:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}





// async replyComment(request: MyRequest, response: Response) {
//     try {
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return response.status(401).json({ message: "Missing or invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, SECRET_KEY);
//         } catch (err) {
//             return response.status(401).json({ message: "Invalid or expired token" });
//         }

//         const userId = decodedToken.userId;
//         const username = decodedToken.username;
//         if (!username) {
//             return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
//         }

//         const { post_id, comment_idx } = request.params;
//         const { reply } = request.body;

//         if (!reply) {
//             return response.status(400).json({ message: "Reply cannot be empty" });
//         }

//         const post = await Post.findByPk(post_id);
//         if (!post || !post.comments || post.comments.length <= parseInt(comment_idx)) {
//             return response.status(404).json({ message: "Post or comment not found" });
//         }

//         const user = await User.findOne({ where: { username } });
//         if (!user) {
//             return response.status(404).json({ message: "User not found" });
//         }

//         const comment = post.comments[parseInt(comment_idx)];

//         if (!comment) {
//             return response.status(400).json({ message: "Invalid comment: missing details" });
//         }

//         // ✅ Get the correct display name based on anonymity
//         const displayAuthor = user.isAnonymous ? user.anonymousName : username;

//         let comments = [...post.comments];

//         if (!Array.isArray(comments[parseInt(comment_idx)].replies)) {
//             comments[parseInt(comment_idx)].replies = [];
//         }

//         const newReply = {
//             username,
//             displayAuthor, // ✅ Store anonymous name or real name
//             profilePic: user.isAnonymous ? user.anonymousProfile : user.profile,
//             reply,
//             createdAt: new Date().toISOString()
//         };

//         comments[parseInt(comment_idx)].replies.push(newReply);

//         await Post.update(
//             { comments: comments },
//             { where: { id: post.id } }
//         );

//         return response.status(200).json({
//             message: "Reply added successfully",
//             comments
//         });
//     } catch (error) {
//         console.error("❌ Error adding reply:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }


async replyComment(request: MyRequest, response: Response) {
    try {
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

        const userId = decodedToken.userId;
        const username = decodedToken.username;
        if (!username) {
            return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
        }

        const { post_id, comment_idx } = request.params;
        const { reply } = request.body;

        if (!reply) {
            return response.status(400).json({ message: "Reply cannot be empty" });
        }

        const post = await Post.findByPk(post_id);
        if (!post || !post.comments || post.comments.length <= parseInt(comment_idx)) {
            return response.status(404).json({ message: "Post or comment not found" });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        const comment = post.comments[parseInt(comment_idx)];

        if (!comment) {
            return response.status(400).json({ message: "Invalid comment: missing details" });
        }

        // ✅ Store anonymity status at the time of replying
        const displayAuthor = user.isAnonymous ? user.anonymousName || "Anonymous" : username;
        const profilePic = user.isAnonymous ? user.anonymousProfile : user.profile;

        let comments = [...post.comments];

        if (!Array.isArray(comments[parseInt(comment_idx)].replies)) {
            comments[parseInt(comment_idx)].replies = [];
        }

        const newReply = {
            username,
            displayAuthor, // ✅ Store static display name
            profilePic, // ✅ Store static profile picture
            reply,
            createdAt: new Date().toISOString()
        };

        comments[parseInt(comment_idx)].replies.push(newReply);

        await Post.update(
            { comments: comments },
            { where: { id: post.id } }
        );

        return response.status(200).json({
            message: "Reply added successfully",
            comments
        });
    } catch (error) {
        console.error("❌ Error adding reply:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}







  async getPostsByUserId(request: MyRequest, response: Response) {
    try {
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

        const loggedInUsername = decodedToken.username; // Logged-in user's username
        if (!loggedInUsername) {
            return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
        }

        const { userId } = request.params;
        if (!userId) {
            return response.status(400).json({ message: "User ID is required" });
        }

        // ✅ Find the user by Clerk ID
        const user = await User.findOne({ where: { clerkId: userId } });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        const loggedInUser = await User.findOne({ where: { username: loggedInUsername } });
        if (!loggedInUser) {
            return response.status(404).json({ message: "Logged-in user not found" });
        }

        // ✅ Fetch posts by the user
        const posts = await Post.findAll({
            where: { author: user.username },
            include: [{
                model: User,
                attributes: ['username', 'fullname', 'profile']
            }],
            attributes: ['id', 'media', 'caption', 'author', 'likes', 'comments', 'visibility', 'createdAt', 'updatedAt']
        });

        // ✅ Get the logged-in user's following list
        const following = loggedInUser.following || [];

        // ✅ Apply visibility filters
        const filteredPosts = posts.filter(post => {
            switch (post.visibility) {
                case 'friends':
                    return following.includes(post.author); // Show only if user follows them
                case 'except_friends':
                    return !following.includes(post.author); // Hide from followers
                case 'everyone':
                    return true; // Show to everyone
                default:
                    return false;
            }
        });

        // ✅ Format posts before sending response
        const formattedPosts = filteredPosts.map(post => ({
            ...post.toJSON(),
            totalLikes: post.likes ? post.likes.length : 0,
            likedBy: post.likes || []
        }));

        return response.status(200).json(formattedPosts);
    } catch (error) {
        console.error("❌ Error fetching posts by user ID:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}

  



async getPostById(request: MyRequest, response: Response) {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({ message: "Post ID is required" });
        }

        // ✅ Fetch the post with author details
        const post = await Post.findByPk(id, {
            include: [{
                model: User,
                attributes: ['userId', 'username', 'fullname', 'profile', 'isAnonymous', 'anonymousProfile', 'anonymousName']
            }],
            attributes: [
                'id', 'media', 'caption', 'author', 'displayAuthor', 'likes', 'comments', 
                'visibility', 'post_category', 'views', 'viewedUsers', 'createdAt', 'updatedAt'
            ]
        });

        if (!post) {
            return response.status(404).json({ message: "Post not found" });
        }

        // ✅ Extract JWT token (if available) to track unique views
        const authHeader = request.headers.authorization;
        let userId = "guest"; // Default for guests

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, SECRET_KEY);
                userId = decodedToken.userId; // Logged-in user ID
            } catch (err) {
                return response.status(401).json({ message: "Invalid or expired token" });
            }
        }

        // ✅ Ensure `viewedUsers` is always an array
        let viewedUsers = Array.isArray(post.viewedUsers) ? post.viewedUsers : [];

        // ✅ Increment view count if user hasn't viewed before
        if (!viewedUsers.includes(userId)) {
            viewedUsers.push(userId); // Add user ID to viewedUsers array
            post.views += 1; // Increment view count

            // ✅ Update the post with new views and viewedUsers
            await post.update({ views: post.views, viewedUsers });

            console.log(`✅ View count updated for post ${post.id}: ${post.views}`);
        } else {
            console.log(`👀 User ${userId} already viewed post ${post.id}`);
        }

        // ✅ Ensure `likes` is always an array
        let likesArray = Array.isArray(post.likes) ? post.likes : [];

        // ✅ Ensure `comments` is always an array
        let comments = Array.isArray(post.comments) ? post.comments : [];

        // ✅ Fetch author details
        const postAuthor = await User.findOne({
            where: { username: post.author },
            attributes: ['userId', 'username', 'isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
        });

        if (!postAuthor) {
            return response.status(404).json({ message: "User not found" });
        }

        // ✅ If `likesArray` contains objects, map correctly
        const likedBy = likesArray.map(like => ({
            username: like.username || "", 
            displayAuthor: like.displayAuthor || "",
            profilePic: like.profilePic || ""
        }));

        // ✅ Process comments safely
        const processedComments = await Promise.all(comments.map(async (comment) => {
            const commentAuthor = await User.findOne({
                where: { username: comment.username },
                attributes: ['isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
            });

            return {
                ...comment,
                displayAuthor: commentAuthor?.isAnonymous ? commentAuthor?.anonymousName || "Anonymous" : comment.username,
                profilePic: commentAuthor?.isAnonymous ? commentAuthor?.anonymousProfile : commentAuthor?.profile,
                replies: await Promise.all((comment.replies || []).map(async (reply) => {
                    const replyAuthor = await User.findOne({
                        where: { username: reply.username },
                        attributes: ['isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
                    });

                    return {
                        ...reply,
                        displayAuthor: replyAuthor?.isAnonymous ? replyAuthor?.anonymousName || "Anonymous" : reply.username,
                        profilePic: replyAuthor?.isAnonymous ? replyAuthor?.anonymousProfile : replyAuthor?.profile,
                    };
                }))
            };
        }));

        return response.status(200).json({
            message: "Post retrieved successfully",
            postDetails: {
                postId: post.id,
                media: post.media,
                caption: post.caption,
                author: post.author,
                displayAuthor: postAuthor.isAnonymous ? (postAuthor.anonymousName || "Anonymous") : postAuthor.username,
                profilePic: postAuthor.isAnonymous ? postAuthor.anonymousProfile : postAuthor.profile,
                visibility: post.visibility,
                post_category: post.post_category,
                totalLikes: likedBy.length,
                likedBy: likedBy,
                comments: processedComments,
                views: post.views,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
        });

    } catch (error) {
        console.error("❌ Error fetching post by ID:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}




// async incrementView(request: MyRequest, response: Response) {
//     try {
//         const { id } = request.params;

//         if (!id) {
//             return response.status(400).json({ message: "Post ID is required" });
//         }

//         const post = await Post.findByPk(id);

//         if (!post) {
//             return response.status(404).json({ message: "Post not found" });
//         }

//         const authHeader = request.headers.authorization;
//         let userId = "guest"; // Default for guest users

//         if (authHeader && authHeader.startsWith("Bearer ")) {
//             const token = authHeader.split(" ")[1];
//             let decodedToken;
//             try {
//                 decodedToken = jwt.verify(token, SECRET_KEY);
//             } catch (err) {
//                 return response.status(401).json({ message: "Invalid or expired token" });
//             }

//             userId = decodedToken.userId; // Get user ID from JWT
//         }

//         // ✅ Ensure `viewedUsers` is an array
//         let viewedUsers = Array.isArray(post.viewedUsers) ? post.viewedUsers : [];

//         // ✅ Prevent duplicate views from the same user
//         if (!viewedUsers.includes(userId)) {
//             viewedUsers.push(userId);

//             // ✅ Increment views count and update in the database
//             await post.update({
//                 views: post.views + 1,
//                 viewedUsers: viewedUsers
//             });

//             return response.status(200).json({
//                 message: "View counted successfully",
//                 views: post.views + 1 // Return updated views count
//             });
//         } else {
//             return response.status(200).json({
//                 message: "User has already viewed this post",
//                 views: post.views
//             });
//         }

//     } catch (error) {
//         console.error("❌ Error updating views:", error);
//         return response.status(500).json({ message: "Internal server error", error: error.message });
//     }
// }

async incrementView(request: MyRequest, response: Response) {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({ message: "Post ID is required" });
        }

        // ✅ Find the post
        const post = await Post.findByPk(id);
        if (!post) {
            return response.status(404).json({ message: "Post not found" });
        }

        // ✅ Extract user info from JWT token (or set as "guest")
        const authHeader = request.headers.authorization;
        let userId = "guest"; // Default for guest users

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, SECRET_KEY);
                userId = decodedToken.userId; // ✅ Get logged-in user ID
            } catch (err) {
                return response.status(401).json({ message: "Invalid or expired token" });
            }
        }

        // ✅ Ensure `viewedUsers` is an array
        let viewedUsers = Array.isArray(post.viewedUsers) ? post.viewedUsers : [];

        // ✅ Prevent duplicate views from the same user
        if (!viewedUsers.includes(userId)) {
            viewedUsers.push(userId); // ✅ Add user ID to viewedUsers array

            // ✅ Increment views count and update in the database
            await post.update({
                views: post.views + 1,
                viewedUsers: viewedUsers
            });

            console.log(`✅ View counted for user: ${userId} on post ${post.id}`);

            return response.status(200).json({
                message: "View counted successfully",
                views: post.views + 1 // Return updated views count
            });
        } else {
            console.log(`👀 User ${userId} already viewed post ${post.id}`);

            return response.status(200).json({
                message: "User has already viewed this post",
                views: post.views
            });
        }

    } catch (error) {
        console.error("❌ Error updating views:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}


async searchPostsByCategory(request: MyRequest, response: Response) {
    try {
        // ✅ Validate Authorization Header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({ message: "Missing or invalid token" });
        }

        // ✅ Verify JWT Token
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return response.status(401).json({ message: "Invalid or expired token" });
        }

        // ✅ Extract Logged-in Username
        const username = decodedToken.username;
        if (!username) {
            return response.status(401).json({ message: "Unauthorized: No username found in JWT" });
        }

        // ✅ Fetch the logged-in user
        const currentUser = await User.findOne({ where: { username } });
        if (!currentUser) {
            return response.status(404).json({ message: "User not found" });
        }

        // ✅ Extract category from request query
        const { category } = request.query;
        if (!category || typeof category !== "string") {
            return response.status(400).json({ message: "Category is required" });
        }

        // ✅ Fetch posts by category
        const posts = await Post.findAll({
            where: { post_category: category.toLowerCase() },
            include: [{
                model: User,
                attributes: ['userId', 'username', 'fullname', 'profile', 'isAnonymous', 'anonymousProfile', 'anonymousName']
            }],
            attributes: [
                'id', 'media', 'caption', 'author', 'displayAuthor', 'likes', 
                'comments', 'visibility', 'post_category', 'views', 'createdAt', 'updatedAt'
            ],
            order: [['createdAt', 'DESC']] // ✅ Show newest posts first
        });

        // ✅ Process posts efficiently
        const processedPosts = await Promise.all(posts.map(async (post) => {
            const postData = post.toJSON();

            // ✅ Fetch user details for the author
            const postAuthor = await User.findOne({
                where: { username: postData.author },
                attributes: ['userId', 'username', 'isAnonymous', 'anonymousName', 'profile', 'anonymousProfile']
            });

            // ✅ Fetch users who liked the post
            const likedUsers = await User.findAll({
                where: { username: postData.likes || [] },
                attributes: ['userId', 'username', 'profile']
            });

            // ✅ Map liked users to include both userId and username
            const likedBy = likedUsers.map(user => ({
                userId: user.userId,
                username: user.username,
                profile: user.profile, // Optional: Include profile pic if needed
            }));

            return {
                ...postData,
                totalLikes: postData.likes.length, // Ensure like count is included
                likedBy: likedBy, // ✅ Show users with `userId` and `username`
                userId: postAuthor?.userId, // ✅ Include userId in response
                displayAuthor: postAuthor?.isAnonymous ? (postAuthor?.anonymousName || "Anonymous") : postAuthor?.username,
                profilePic: postAuthor?.isAnonymous ? postAuthor?.anonymousProfile : postAuthor?.profile, // ✅ Show anonymous profile if user is anonymous
            };
        }));

        return response.status(200).json({
            message: `Posts retrieved successfully for category: ${category}`,
            posts: processedPosts
        });

    } catch (error) {
        console.error("❌ Error fetching posts by category:", error);
        return response.status(500).json({ message: "Internal server error", error: error.message });
    }
}


}

