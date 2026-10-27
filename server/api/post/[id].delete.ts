import {defineEventHandler, createError} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {routeId} from '~/server/utils/routeId';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = routeId(event, 'Post not found');

    const deletedCount = await Post.destroy({where: {id}});
    if (deletedCount === 0) {
        throw createError({statusCode: 404, statusMessage: 'Post not found'});
    }

    return {id};
});
