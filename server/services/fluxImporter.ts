import {createError} from 'h3';
import {extract as FeedExtractor} from "@extractus/feed-extractor";
import {extract as ArticleExtractor} from "@extractus/article-extractor";
import DOMPurify from "dompurify";
import type {PostInterface} from "~/server/models/post";
import Post from "~/server/models/post";
import {JSDOM} from 'jsdom';
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

                const window = new JSDOM('').window;
                const purify = DOMPurify(window);
                const sanitizedContent = purify.sanitize(content, {
                    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'li', 'a', 'img', 'u', 's', 'br'],
                    ALLOWED_ATTR: ['src', 'alt', 'title']
                });

                const post = await Post.create({
                    postTitle: title,
                    author: author,
                    content: sanitizedContent,
                    externalId: externalId,
                    publishDate: new Date(published),
                });
                contents.push(post);
            } catch (error) {
                console.error(`flux: article ignoré (${item.link})`, error);
            }
        }

        return contents;

    }

}
