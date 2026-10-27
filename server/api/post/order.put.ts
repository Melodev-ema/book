import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";
import Part from "~/server/models/part";
import db from "~/server/utils/db";

// Range des textes dans une partie, dans cet ordre : body = { partId: number | null, ids: [id du 1er texte, …] }
// (partId null = hors partie). Sert à déplacer un texte d'une partie à l'autre comme à réordonner une partie.
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const body = await readBody(event);
    const partId = body?.partId === null || body?.partId === undefined || body?.partId === '' ? null : Number(body.partId);
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];

    if (ids.length === 0 || ids.some((id: number) => !Number.isInteger(id))) {
        throw createError({statusCode: 400, statusMessage: 'ids doit être une liste d\'identifiants'});
    }
    if (partId !== null && !(await Part.findByPk(partId))) {
        throw createError({statusCode: 400, statusMessage: 'Partie inconnue'});
    }

    await db.sequelize.transaction(async (transaction) => {
        for (const [position, id] of ids.entries()) {
            await Post.update({partId, position}, {where: {id}, transaction});
        }
    });

    return {partId, ids};
});
