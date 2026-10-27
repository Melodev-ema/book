import {defineEventHandler} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import ApiToken from "~/server/models/apiToken";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    return await ApiToken.findAll(
        {
            order: [
                ['createdAt', 'DESC'],
            ],
        }
    );
});
