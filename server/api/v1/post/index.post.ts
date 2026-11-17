import {defineEventHandler, createError, readBody} from 'h3';
import {z} from 'zod';
import Post from "~/server/models/post";
import PostEntity from "~/entities/PostEntity";
import {sanitizeContent} from "~/server/services/contentSanitizer";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    //validate with zod
    const postSchema = PostEntity.schema;
    const result = postSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Requête invalide',
            data: z.treeifyError(result.error)  // structure simple des erreurs
        });
    }

    const postTitle = sanitizeContent(body.postTitle);
    const postAuthor = sanitizeContent(body.author);
    const postContent = sanitizeContent(body.content);
    const postPublishDate = new Date(body.publishDate);
    return await Post.create({
        postTitle: postTitle,
        author: postAuthor,
        content: postContent,
        publishDate: postPublishDate,
    });
});
