import {DataTypes, Model} from "sequelize";
import db from "~/server/utils/db";

export interface AttachmentInterface {
    id: number;
    name: string;
    type: string;
    pageType: string;
    size: number;
    url: string;
}

export default class Attachment extends Model implements AttachmentInterface {
    public id!: number;
    public name!: string;
    public type!: string;
    public pageType!: string;
    public size!: number;
    public url!: string;

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Attachment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('image', 'pdf'),
            allowNull: false,
        },
        pageType: {
            type: DataTypes.ENUM('cover', 'title', 'copyright', 'dedication_page', 'table_of_contents', 'preface_introduction', 'chapters', 'interlude_boxed_section', 'appendices', 'author_notes', 'index', 'acknowledgments_page', 'publisher_page', 'advertisements_other_books', 'back_cover'),
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        url: {
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
        tableName: 'Attachments',
        sequelize: db.sequelize,
    }
);
