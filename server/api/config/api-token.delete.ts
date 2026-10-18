import {defineEventHandler, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);
    const data = await readBody(event);
    const id = data.id;

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
