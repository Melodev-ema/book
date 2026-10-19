import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";
import generateSiteToken from "~/server/utils/tokenGenertor";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    const data = await readBody(event);
    const name = typeof data?.name === 'string' ? data.name.trim() : '';
    if (!name) {
        throw createError({statusCode: 400, statusMessage: 'Le nom du token est requis'});
    }

    // 5 tokens actifs au plus
    if (await ApiToken.count(
        {
            where: {
                revoked: false,
            },
        }
    ) >= 5) {
        throw createError({
            statusCode: 400,
            statusMessage: '5 tokens actifs au maximum'
        });
    }

    return await ApiToken.create({
        name: name,
        token: generateSiteToken(),
    });
});
