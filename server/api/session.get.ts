import {defineEventHandler} from 'h3';
import {getUserSession} from '~/server/utils/session';

export default defineEventHandler(async (event) => {
    const {user} = await getUserSession(event);
    return {loggedIn: !!user, user: user ?? null};
});
