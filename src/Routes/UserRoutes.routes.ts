import express from "express";
import { Router } from "express";
import {followUser, acceptFollowRequest, rejectFollowRequest, unfollowUser,getUserDetailsofclerk,updateUserInterests,toggleAnonymity,getUserDetailsByIdentifier,savePersonalityType,getPersonalityType,removeFollower,editUserProfile} from "../Controller/User.controller";
import { authenticate } from "../Config/clerksetup";
import { syncClerkUsers } from "../Controller/User.controller";
import { json } from "body-parser";


const router = express.Router();



// ✅ Sync existing Clerk users to PostgreSQL
router.get("/sync-clerk-users", syncClerkUsers);


// ✅ Follow a user
router.post("/api/follow", json(), authenticate, (request, response) => {
  followUser(request, response);
});

// ✅ Accept a follow request
router.post("/api/accept-follow", json(), authenticate, (request, response) => {
  acceptFollowRequest(request, response);
});

// ✅ Reject a follow request
router.post("/api/reject-follow", json(), authenticate, (request, response) => {
  rejectFollowRequest(request, response);
});

// ✅ Unfollow a user
router.post("/api/unfollow", json(), authenticate, (request, response) => {
  unfollowUser(request, response);
});

// author remove the followers
router.post("/api/user/removeFollower", json(), authenticate, (request, response) => {
  removeFollower(request, response);
});

//get user details of clerk
router.get("/api/users/me", authenticate, (request, response) => {
  getUserDetailsofclerk(request, response);
});

router.put("/api/user/interests", authenticate, (request, response) => {
  updateUserInterests(request, response);
});

router.post("/api/user/toggleAnonymity", json(), authenticate, (request, response) => {
  toggleAnonymity(request, response);
});


router.get("/api/user/:identifier", authenticate, (request, response) => {
  getUserDetailsByIdentifier(request, response);
});

router.post("/api/user/personality", json(), authenticate, (request, response) => {
  savePersonalityType(request, response);
});


router.get("/api/user/personality/:username", authenticate, (request, response) => {
  getPersonalityType(request, response);
});

router.post("/api/user/removeFollower", json(), authenticate, (request, response) => {
  removeFollower(request, response);
});

// ✅ Edit User Profile
router.put("/api/user/edit-profile", json(), authenticate, (request, response) => {
  editUserProfile(request, response);
});



export default router;


