import type {PostInterface} from "~/server/models/post";
import {z} from "zod";

export interface PostEntityInterface {
    id: number | null;
    postTitle: string;
    author: string;
    content: string;
    timestamp: number;
    date: Date;
    publishDate: Date;
    attachments?: [];
    partId?: number | null;
    position?: number;
}

export default class PostEntity implements PostEntityInterface {
    public id: number | null;
    public postTitle: string;
    public author: string;
    public content: string;
    public timestamp: number;
    public date: Date;
    public publishDate: Date;
    public attachments?: [];
    // Partie du livre (null = sans partie)
    public partId: number | null;
    // Ordre du texte dans sa partie (croissant ; à égalité, le plus récent d'abord)
    public position: number;

    constructor(id: number | null, postTitle: string, author: string, content: string, timestamp: number, publishDate: Date, attachments?: [], partId: number | null = null, position: number = 0) {
        this.id = id;
        this.postTitle = postTitle;
        this.author = author;
        this.content = content;
        this.timestamp = timestamp;
        this.date = new Date(timestamp);
        this.publishDate = publishDate;
        this.attachments = attachments;
        this.partId = partId;
        this.position = position;
    }

    public static hydrateFromDatabase(data: PostInterface) {
        return new PostEntity(
            data.id,
            data.postTitle,
            data.author,
            data.content,
            new Date(data.createdAt).getTime(),
            new Date(data.publishDate),
            undefined,
            data.partId ?? null,
            data.position ?? 0,
        );
    }

    * [Symbol.iterator]() {
        yield this.id?.toString() ?? '';
        yield this.postTitle;
        yield this.author;
        yield this.content;
        yield this.timestamp.toString();
        yield this.date.toLocaleDateString('fr');
        yield this.publishDate.toLocaleDateString('fr');
        yield JSON.stringify(this.attachments);
    }

    public static create(postTitle: string = '', author: string = '', content: string = '', attachments?: []) {
        return new PostEntity(null, postTitle, author, content, new Date().getTime(), new Date(), attachments);
    }

    public static schema = z.object({
        id: z.number().optional(),
        postTitle: z.string(),
        author: z.string(),
        content: z.string(),
        // Absence vérifiée avant la coercion : une fois convertie, une date manquante ne se distingue plus d'une date invalide
        publishDate: z.any()
            .refine(value => value !== undefined, "La date de publication est requise")
            .pipe(z.coerce.date({error: "publishDate doit être une date valide (ISO 8601)"})),
        attachments: z.array(z.string()).optional(),
    });
}
