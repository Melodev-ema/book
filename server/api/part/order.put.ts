import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Part from "~/server/models/part";
import db from "~/server/utils/db";

// Réordonne les parties : body = { ids: [id de la partie I, id de la partie II, …] }
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const body = await readBody(event);
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];

    if (ids.length === 0 || ids.some((id: number) => !Number.isInteger(id))) {
        throw createError({statusCode: 400, statusMessage: 'ids doit être une liste d\'identifiants'});
    }

    await db.sequelize.transaction(async (transaction) => {
        for (const [position, id] of ids.entries()) {
            await Part.update({position}, {where: {id}, transaction});
        }
    });

    return await Part.findAll({order: [['position', 'ASC'], ['id', 'ASC']]});
});
