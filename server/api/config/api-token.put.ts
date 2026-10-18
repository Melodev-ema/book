import {defineEventHandler, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    const data = await readBody(event);
    const {id, name} = data;

    await ApiToken.update({
        name: name,
    }, {
        where: {
            id: id,
        },
    });

    return await ApiToken.findByPk(id);
});