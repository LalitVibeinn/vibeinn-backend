import express from "express";
import { authenticateUser,  generateJwt } from "../Controller/Auth.controller";
const router = express.Router();
import { authenticate } from "../Config/clerksetup";
import { MyRequest } from "@/Interfaces/Request.interface";

router.post("/auth/callback", authenticateUser);

router.post("/generateJwt", authenticate, generateJwt);





export default router;
