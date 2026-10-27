import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {routeId} from '~/server/utils/routeId';
import Part from "~/server/models/part";

// Renomme une partie
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = routeId(event, 'Part not found');
    const body = await readBody(event);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
        throw createError({statusCode: 400, statusMessage: 'Le titre de la partie est requis'});
    }

    const part = await Part.findByPk(id);
    if (!part) {
        throw createError({statusCode: 404, statusMessage: 'Part not found'});
    }

    return await part.update({title});
});
