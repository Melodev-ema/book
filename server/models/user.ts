import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface UserInterface {
    id: number | null;
    name: string;
    email: string;
    password: string;
    emailVerified: boolean;
    role: UserRole;
    active: boolean;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export default class User extends Model implements UserInterface {
    public id!: number | null;
    public name!: string;
    public email!: string;
    public password!: string;
    public emailVerified!: boolean;
    public role!: UserRole;
    public active!: boolean;

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        role: {
            type: DataTypes.ENUM,
            values: [
                'admin',
                'user',
            ],
            defaultValue: 'user',
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    }, {
        tableName: 'Users',
        sequelize: db.sequelize,
    }
);
