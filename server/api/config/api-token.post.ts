import {defineEventHandler, createError, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";
import generateSiteToken from "~/server/utils/tokenGenertor";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    const data = await readBody(event);
    const name = data.name;

    //max 10 tokens
    if (await ApiToken.count(
        {
            where: {
                revoked: false,
            },
        }
    ) >= 5) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Maximum 10 tokens allowed'
        });
    }

    return await ApiToken.create({
        name: name,
        token: generateSiteToken(),
    });
});
