import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
  type: "private" | "group";
  participants: {
    userId: string;
    fullName: string;
    profilePic: string;
  }[];
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["private", "group"], required: true },
    participants: [
      {
        userId: { type: String, required: true },
        fullName: { type: String, required: true },
        profilePic: { type: String }
      }
    ],
    createdAt: { type: Date, default: () => new Date() } // ✅ Explicitly return Date object
  },
  { timestamps: true } // ✅ Auto adds `createdAt` & `updatedAt`
);

export default mongoose.model<IChat>("Chat", ChatSchema);
