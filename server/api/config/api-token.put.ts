import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    const data = await readBody(event);
    const id = Number(data?.id);
    const name = typeof data?.name === 'string' ? data.name.trim() : '';
    if (!Number.isInteger(id) || !name) {
        throw createError({statusCode: 400, statusMessage: 'Le nom du token est requis'});
    }

    await ApiToken.update({
        name: name,
    }, {
        where: {
            id: id,
        },
    });

    return await ApiToken.findByPk(id);
});
