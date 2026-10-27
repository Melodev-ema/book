import {createError} from 'h3';
import {extract as FeedExtractor} from "@extractus/feed-extractor";
import {extract as ArticleExtractor} from "@extractus/article-extractor";
import type {PostInterface} from "~/server/models/post";
import Post from "~/server/models/post";
import {sanitizeContent} from "~/server/services/contentSanitizer";
import slugify from "slugify";
import {createHash} from 'crypto';

export class FluxImporter {
    private readonly _url: string;

    constructor(url: string) {
        this._url = url;
    }

    public async import() {
        const url = this._url;
        if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
            throw createError({statusCode: 400, statusMessage: 'Adresse du flux invalide'});
        }

        const feed = await FeedExtractor(url);
        if (!feed || !feed.entries) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No articles found'
            });
        }

        const contents: PostInterface[] = [];
        for (const item of feed.entries) {
            if (!item.link || !item.id) {
                continue;
            }

            const slug = slugify(item.id, {lower: true, strict: true});
            const externalId = createHash('md5').update(slug).digest('hex');
            // Déjà importé lors d'un import précédent du même flux
            if (await Post.findOne({where: {externalId}})) {
                continue;
            }

            // Un article illisible ou invalide est passé, sans arrêter l'import des autres
            try {
                const article = await ArticleExtractor(item.link);
                const {title, content, author, published} = article ?? {};
                if (!title || !content || !author || !published) {
                    continue;
                }

                // Date illisible : celle de l'import, comme pour les fichiers
                const publishDate = new Date(published);
                const post = await Post.create({
                    postTitle: title,
                    author: author,
                    content: sanitizeContent(content),
                    externalId: externalId,
                    publishDate: isNaN(publishDate.getTime()) ? new Date() : publishDate,
                });
                contents.push(post);
            } catch (error) {
                console.error(`flux: article ignoré (${item.link})`, error);
            }
        }

        return contents;

    }

}
