//Models/post.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";
import User from "./User.model";
   
@Table({
  tableName: "posts",
  timestamps: true,  
  underscored: true,
})
export default class Post extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    allowNull: false
  })
  media!: string[];

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  caption!: string;

 

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  author!: string; // ✅ Always stores the real username

  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  displayAuthor!: string; // ✅ Stores the anonymous name or real name

  @BelongsTo(() => User, { foreignKey: "author", targetKey: "username", onDelete: "CASCADE" }) 
  user!: User;

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    defaultValue: [],
  })  
  likes!: string[];
  
  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  comments!: any;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: "everyone"
  })
  visibility!: string;

    // ✅ New column for post category
    @Column({
      type: DataType.STRING(100),
      allowNull: false,
      defaultValue: "general" // Default category
    })
    post_category!: string;

    //for views
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default value is 0
    })
    views!: number;

    @Column({
      type: DataType.ARRAY(DataType.STRING), // ✅ Store an array of user IDs who viewed the post
      defaultValue: []
    })
    viewedUsers!: string[];
    

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: "created_at",
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: "updated_at",
  })
  updatedAt!: Date;
}
