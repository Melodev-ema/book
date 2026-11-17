import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface ApiTokenInterface {
    id: string
    name: string
    token: string
    revokedAt: Date | null
    revoked: boolean
}

export default class ApiToken extends Model implements ApiTokenInterface {
    public id!: string;
    public name!: string;
    public token!: string;
    public revokedAt!: Date | null;
    public revoked: boolean = false;

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ApiToken.init(
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
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        revokedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        tableName: 'ApiTokens',
        sequelize: db.sequelize,
    }
);
