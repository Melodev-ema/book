import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);
    const data = await readBody(event);
    const id = Number(data?.id);
    if (!Number.isInteger(id)) {
        throw createError({statusCode: 400, statusMessage: 'Token inconnu'});
    }

    await ApiToken.update({
        revoked: true,
        revokedAt: new Date(),
    }, {
        where: {
            id: id,
        },
    });

    return await ApiToken.findByPk(id);
});
