import {defineEventHandler} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";
import Prospect from "~/server/models/prospect";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const postsCount = await Post.count();
    const prospectsCount = await Prospect.count();

    return {
        posts: {name: 'Pages de votre livre', value: postsCount},
        prospects: {name: 'Utilisateurs (prospects)', value: prospectsCount},
        ebook: {name: 'E-book générés', value: 0},
        book: {name: 'Livres achetés', value: 0},
    };
});
