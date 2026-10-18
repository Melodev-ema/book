import {defineEventHandler, getQuery} from 'h3';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    //@todo : access control from front only
    const query = getQuery(event);
    const limit: number = parseInt(Array.isArray(query.limit) ? query.limit[0] : query.limit) || 10;
    const page: number = parseInt(Array.isArray(query.page) ? query.page[0] : query.page) || 1;

    // « limit=all » : tous les textes, pour composer le livre et son sommaire
    const all = query.limit === 'all';

    const queryPosts = Post.findAndCountAll({
        ...(all ? {} : {limit: limit, offset: (page - 1) * limit}),
        order: [['createdAt', 'DESC']],
    });

    try {
        return await queryPosts;
    } catch (error) {
        return error;
    }
});
