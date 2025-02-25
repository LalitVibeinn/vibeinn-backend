// import {
//     Table,
//     Column,
//     Model,
//     DataType,
//     ForeignKey,
//     BelongsTo,
//     CreatedAt,
//     UpdatedAt,
//     PrimaryKey
// } from 'sequelize-typescript';
// import User from "./User.model"; // Import User model for foreign key reference

// @Table({
//     tableName: 'stories',
//     timestamps: true, // Enables createdAt & updatedAt fields automatically
// })
// export default class Story extends Model {
      
//     @PrimaryKey
//     @Column({
//         type: DataType.BIGINT,
//         autoIncrement: true,
//         allowNull: false
//     })
//     id!: number; // Unique Story ID


//     @ForeignKey(() => User)
//     @Column({
//         type: DataType.UUID,  // ✅ Use UUID for `userId`
//         allowNull: false
//     })
//     userId!: string; // ✅ Store userId instead of just username

//     @ForeignKey(() => User)
//     @Column({
//         type: DataType.STRING(150),
//         allowNull: false
//     })
//     owner!: string; // Foreign Key referencing User.username

//     @BelongsTo(() => User, { 
//         foreignKey: "owner", 
//         targetKey: "username", 
//         onDelete: "CASCADE"  // If user is deleted, remove all their stories
//     })
//     user!: User; // Relationship: Story belongs to User

//     @Column({
//         type: DataType.STRING(255),
//         allowNull: false
//     })
//     media!: string; // URL or path to the story media (image/video)

//     @Column({
//         type: DataType.STRING(255),
//         allowNull: true
//     })
//     text!: string; // Optional text content in the story

//     @CreatedAt
//     @Column({
//         type: DataType.DATE,
//         allowNull: false,
//         defaultValue: DataType.NOW
//     })
//     createdAt!: Date; // Auto timestamp when story is created

//     @Column({
//         type: DataType.DATE,
//         allowNull: false
//     })
//     expiresAt!: Date; // Expiration time (e.g., 24 hours later)

// }


import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    PrimaryKey
} from 'sequelize-typescript';
import User from "./User.model"; // Import User model for foreign key reference

@Table({
    tableName: 'stories',
    timestamps: true, // Enables createdAt & updatedAt fields automatically
})
export default class Story extends Model {
      
    @PrimaryKey
    @Column({
        type: DataType.BIGINT,
        autoIncrement: true,
        allowNull: false
    })
    id!: number; // Unique Story ID

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,  // ✅ Use UUID for `userId`
        allowNull: false
    })
    userId!: string; // ✅ Store userId instead of just username  

    @BelongsTo(() => User, { 
        foreignKey: "userId", 
        targetKey: "userId", 
        onDelete: "CASCADE"  // If user is deleted, remove all their stories
    })
    user!: User; // Relationship: Story belongs to User

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    media!: string; // URL or path to the story media (image/video)

    @Column({
        type: DataType.STRING(255),
        allowNull: true
    })
    text!: string; // Optional text content in the story

    @CreatedAt
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    createdAt!: Date; // Auto timestamp when story is created

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    expiresAt!: Date; // Expiration time (e.g., 24 hours later)

}
