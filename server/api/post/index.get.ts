import {defineEventHandler, getQuery} from 'h3';
import Post from "~/server/models/post";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    // 100 textes par page au plus
    const limit: number = Math.min(parseInt(Array.isArray(query.limit) ? query.limit[0] : query.limit) || 10, 100);
    const page: number = parseInt(Array.isArray(query.page) ? query.page[0] : query.page) || 1;

    // « limit=all » : tous les textes, pour composer le livre et son sommaire
    const all = query.limit === 'all';

    return await Post.findAndCountAll({
        ...(all ? {} : {limit: limit, offset: (Math.max(page, 1) - 1) * limit}),
        order: [['createdAt', 'DESC']],
    });
});
