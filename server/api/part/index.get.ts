import {defineEventHandler} from 'h3';
import Part from "~/server/models/part";

// Le livre et l'admin en ont besoin (session, ou jeton du PDF). La page d'accueil passe par /api/book-toc.
export default defineEventHandler(async () => {
    return await Part.findAll({order: [['position', 'ASC'], ['id', 'ASC']]});
});
