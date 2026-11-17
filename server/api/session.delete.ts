import {defineEventHandler} from 'h3';
import {clearUserSession} from '~/server/utils/session';

export default defineEventHandler(async (event) => {
    await clearUserSession(event);
    return {};
});
