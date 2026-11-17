import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Part from "~/server/models/part";

// Crée une partie, placée après les autres
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const body = await readBody(event);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
        throw createError({statusCode: 400, statusMessage: 'Le titre de la partie est requis'});
    }

    const last = (await Part.max('position')) as number | null;
    return await Part.create({title, position: (last ?? -1) + 1});
});
