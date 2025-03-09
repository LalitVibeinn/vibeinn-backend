
//Interfaces/Request.interface.ts
import { Request } from "express";
import { AuthObject } from "@clerk/clerk-sdk-node";
import { JwtPayload } from "jsonwebtoken";

export interface MyRequest extends Request {
  auth?: AuthObject; // Clerk's authentication object
  token?: JwtPayload & { 
    userId: string; 
    username: string;
    firstName: string;
    lastName: string;
    fullname?: string; // ✅ Allow fullname as well
    email?: string;
  };
}



