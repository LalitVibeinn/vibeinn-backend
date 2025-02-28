

// Model/User.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Unique,
  IsEmail,
  CreatedAt,
  UpdatedAt,
  HasMany
} from "sequelize-typescript";
import Post from "./Post.model"; // ✅ Import Post Model
import { v4 as uuidv4 } from "uuid"; 

@Table({
  tableName: "users",
  timestamps: true,
})
export default class User extends Model {

 
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4, // ✅ Correct UUID generation
    allowNull: false,
  })
  userId!: string; // ✅ New Unique User ID
    
  @PrimaryKey
  @Unique
  @Column(DataType.STRING(150))
  username!: string;

  @IsEmail
  @Unique
  @Column(DataType.STRING(150))
  email!: string;

  @Column(DataType.STRING(150))
  fullname!: string;

  @Column(DataType.STRING(150))  // ✅ New Column for Anonymous Name
  anonymousName!: string | null; 


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false, // ✅ Default: User is not anonymous
  })
  isAnonymous!: boolean;
  
  @Column(DataType.ARRAY(DataType.TEXT)) // ✅ New interests column
  interests!: string[];


  @Column({
    type: DataType.INTEGER,
    defaultValue: 100, // ✅ Every user starts with base 100 Vibe Score
  })
  vibeScore!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  vibeCount!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: "Runner",  // Default rank
  })
  rank!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0, // ✅ New Column to Track Post Count
  })
  postCount!: number;

  @Column(DataType.STRING(500))
  bio!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING), // ✅ Store answers as an array of strings
    allowNull: true,
  })
  personality_type!: string[] | null;
  

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false, // ✅ Default value is false
  })
  hasAnsweredPersonality!: boolean;
  

  @Column(DataType.ARRAY(DataType.TEXT))
  following!: string[];

  @Column(DataType.ARRAY(DataType.TEXT))
  followers!: string[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0, // ✅ Default follower count is 0
    allowNull: false,
  })
  followers_count!: number;
  

  @Column(DataType.STRING(150))
  profile!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  pending_requests!: string[];

  @Column(DataType.STRING(150))
  clerkId!: string;

  //for chat
  @Column({
    type: DataType.ARRAY(DataType.JSON),
    allowNull: false,
    defaultValue: [],
  })
  chatRequests!: { senderId: string; senderName: string; isAnonymous: boolean }[];
  

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "createdAt", // ✅ Force correct column name
  })
  createdAt!: Date;
  
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updatedAt", // ✅ Force correct column name
  })
  updatedAt!: Date;

  // ✅ Define relationship: One User has Many Posts
  @HasMany(() => Post, { foreignKey: "author", sourceKey: "username", onDelete: "CASCADE" })
  posts!: Post[];
}
