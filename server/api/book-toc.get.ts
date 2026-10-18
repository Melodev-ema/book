import {defineEventHandler} from 'h3';
import BookConfig from "~/server/models/bookConfig";
import Part from "~/server/models/part";
import Post from "~/server/models/post";
import {landingToc, landingTocLimit} from "~/utils/bookToc";

// Public : le sommaire de la page d'accueil. Seulement les titres et numéros des premières parties
// (dans la limite réglée), et le nombre des autres ; rien du contenu des textes.
export default defineEventHandler(async () => {
    const config = await BookConfig.findOne();
    if (!config?.get('showToc')) {
        return {parts: [], hiddenCount: 0};
    }

    const [posts, parts] = await Promise.all([
        Post.findAll({attributes: ['partId'], raw: true}),
        Part.findAll({attributes: ['id', 'title'], order: [['position', 'ASC'], ['id', 'ASC']], raw: true}),
    ]);
    return landingToc(posts, parts, landingTocLimit(config.get('landingTocMaxParts')));
});
