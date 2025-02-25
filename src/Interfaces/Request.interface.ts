// import { Request } from 'express';
// import { JwtPayload } from 'jsonwebtoken';

// export interface MyRequest extends Request {
//   token: JwtPayload;
// }


// import { Request } from 'express';
// import { JwtPayload } from 'jsonwebtoken';

// export interface MyRequest extends Request {
//   token: JwtPayload & { username: string; email: string };
// }

//interfaces/Request.interface.ts

// import { Request } from "express";
// import { AuthObject } from "@clerk/clerk-sdk-node";

// export interface MyRequest extends Request {
//   auth?: AuthObject; // Clerk's authentication object
// }


// import { Request } from "express";
// import { AuthObject } from "@clerk/clerk-sdk-node";
// import { JwtPayload } from "jsonwebtoken";

// export interface MyRequest extends Request {
//   auth?: AuthObject; // Clerk's authentication object
//   token?: JwtPayload & { username: string; email?: string; userId?: string }; // Decoded JWT
// }

// import { Request } from "express";
// import { AuthObject } from "@clerk/clerk-sdk-node";
// import { JwtPayload } from "jsonwebtoken";

// export interface MyRequest extends Request {
//   auth?: AuthObject; // Clerk's authentication object
//   token?: JwtPayload & { 
//     userId: string; 
//     firstName: string; 
//     lastName: string;
//     email?: string;
//   }; // Decoded JWT with Clerk user info
// }

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



