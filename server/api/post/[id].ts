import {defineEventHandler, getRouterParam} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const id = getRouterParam(event, 'id');

    try {
        return await Post.findByPk(id);
    } catch (error) {
        return error;
    }
});
