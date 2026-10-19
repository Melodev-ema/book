import {defineEventHandler} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";
import Prospect from "~/server/models/prospect";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const [postsCount, prospectsCount] = await Promise.all([Post.count(), Prospect.count()]);

    return {
        posts: {name: 'Pages de votre livre', value: postsCount},
        prospects: {name: 'Extraits demandés', value: prospectsCount},
    };
});
