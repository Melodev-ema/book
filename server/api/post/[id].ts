import {defineEventHandler, createError, getRouterParam} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = getRouterParam(event, 'id');

    const post = await Post.findByPk(id);
    if (!post) {
        throw createError({statusCode: 404, statusMessage: 'Post not found'});
    }
    return post;
});
