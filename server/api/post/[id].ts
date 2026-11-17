import {defineEventHandler, createError} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {routeId} from '~/server/utils/routeId';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = routeId(event, 'Post not found');

    const post = await Post.findByPk(id);
    if (!post) {
        throw createError({statusCode: 404, statusMessage: 'Post not found'});
    }
    return post;
});
