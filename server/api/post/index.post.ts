import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";
import {sanitizeContent} from "~/server/services/contentSanitizer";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    const body = await readBody(event);

    if (!body.postTitle || !body.content) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body'
        });
    }

    if (body.id === undefined || body.id === null) {

        const content = sanitizeContent(body.content);

        return await Post.create({
            postTitle: body.postTitle,
            author: body.author ?? '',
            content: content,
            publishDate: new Date(),
        });

    }

    const post = await Post.findByPk(body.id);
    if (!post) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Post not found'
        });
    }

    await post.update({
        postTitle: body.postTitle,
        content: sanitizeContent(body.content),
        // L'auteur n'est modifié que s'il est envoyé
        ...(typeof body.author === 'string' ? {author: body.author} : {}),
    });
    return post;

});
