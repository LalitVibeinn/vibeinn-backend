
// import mongoose, { Schema, Document } from "mongoose";

// interface IChat extends Document {
//   type: "private" | "group";
//   participants: {
//     userId: string;
//     fullName: string;
//     profilePic: string;
//   }[];
//   isAccepted: boolean; // ✅ New field to track if the chat request was accepted
//   createdAt: Date;
// }

// const ChatSchema = new Schema<IChat>(
//   {
//     type: { type: String, enum: ["private", "group"], required: true },
//     participants: [
//       {
//         userId: { type: String, required: true },
//         fullName: { type: String, required: true },
//         profilePic: { type: String },
//       },
//     ],
//     isAccepted: { type: Boolean, default: false }, // ✅ Chat request starts as unaccepted
//     createdAt: { type: Date, default: () => new Date() }, // ✅ Explicitly return Date object
//   },
//   { timestamps: true } // ✅ Auto adds `createdAt` & `updatedAt`
// );

// export default mongoose.model<IChat>("Chat", ChatSchema);

import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
  type: "private" | "group";
  participants: {
    userId: string;
    fullName: string;
    anonymousName?: string;
    profilePic: string;
  }[];
  isAccepted: boolean;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["private", "group"], required: true },
    participants: [
      {
        userId: { type: String, required: true },
        fullName: { type: String, required: true },
        anonymousName: { type: String, default: null },
        profilePic: { type: String },
      },
    ],
    isAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
