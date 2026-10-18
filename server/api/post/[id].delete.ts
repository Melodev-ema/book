import {defineEventHandler, createError, getRouterParam} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = getRouterParam(event, 'id');

    const deletedCount = await Post.destroy({where: {id}});
    if (deletedCount === 0) {
        throw createError({statusCode: 404, statusMessage: 'Post not found'});
    }

    return {id: Number(id)};
});
