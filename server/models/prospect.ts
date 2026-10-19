import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface ProspectInterface {
    id: number;
    email: string;
    newsletterConsent: boolean;
    consentAt: Date | null;
}

export default class Prospect extends Model {
    public id!: number;
    public email!: string;
    public newsletterConsent!: boolean;
    public consentAt!: Date | null;

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
        // Accord pour recevoir les nouvelles du livre, et sa date
        newsletterConsent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        consentAt: {
            type: DataTypes.DATE,
            allowNull: true,
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
