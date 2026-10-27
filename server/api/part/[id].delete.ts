import {defineEventHandler, createError} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {routeId} from '~/server/utils/routeId';
import Part from "~/server/models/part";
import Post from "~/server/models/post";
import db from "~/server/utils/db";

// Supprime une partie ; ses textes restent dans le livre, sans partie
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = routeId(event, 'Part not found');

    const deletedCount = await db.sequelize.transaction(async (transaction) => {
        await Post.update({partId: null}, {where: {partId: id}, transaction});
        return await Part.destroy({where: {id}, transaction});
    });

    if (deletedCount === 0) {
        throw createError({statusCode: 404, statusMessage: 'Part not found'});
    }

    return {id};
});
