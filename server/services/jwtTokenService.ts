import {createError} from 'h3';
import ApiToken from "~/server/models/apiToken";

export const verifyToken = async (authHeader: string | undefined) => {
    if (!authHeader?.startsWith('Bearer ')) {
        throw createError({statusCode: 401, statusMessage: 'Missing token'});
    }

    const token = authHeader.slice(7);

    const tokenFromDb = await ApiToken.findOne({
        where: {
            token: token,
            revoked: false,
        },
    });

    if (!tokenFromDb) {
        throw createError({statusCode: 401, statusMessage: 'Invalid token'});
    }

    return tokenFromDb;

};
