import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface ProspectInterface {
    id: number;
    // null une fois effacée (30 jours après la demande, sans accord)
    email: string | null;
    newsletterConsent: boolean;
    consentAt: Date | null;
    // Dernier contact volontaire (demande d'extrait) : point de départ des 3 ans de conservation des abonnés
    lastContactAt: Date | null;
}

export default class Prospect extends Model {
    public id!: number;
    public email!: string | null;
    public newsletterConsent!: boolean;
    public consentAt!: Date | null;
    public lastContactAt!: Date | null;

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
            allowNull: true,
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
        lastContactAt: {
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
