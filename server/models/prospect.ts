import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface ProspectInterface {
    id: number;
    email: string;
}

export default class Prospect extends Model {
    public id!: number;
    public email!: string;

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Prospect.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'Prospects',
        sequelize: db.sequelize,
    }
);
