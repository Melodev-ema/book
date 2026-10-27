import BookConfig from "~/server/models/bookConfig";
import SiteConfig from "~/server/models/siteConfig";
import Part from "~/server/models/part";
import Post from "~/server/models/post";
import Attachment from "~/server/models/attachment";
import {landingToc, landingTocLimit} from "~/utils/bookToc";
import {mergeLandingContent} from "~/utils/landingContent";

// Logique des GET publics, partagée entre les handlers de l'API et le rendu serveur de la landing

export const findBookConfig = async () => {
    const config = await BookConfig.findOne();

    if (!config) {
        return {
            title: 'Recueil de Poèmes',
            author: '',
            years: '2019 - 2024',
            dedicationText: '',
            dedicationAuthor: '',
            prefaceText: '',
            pageFormat: 'a4',
            maxLines: 38,
            maxLinesFirstPage: 32,
            pageStart: 6,
            showSignature: true,
            showToc: false,
            tocPosition: 'start',
            landingTocMaxParts: 6,
        };
    }

    return config;
};

export const findSiteConfig = async () => {
    const config = await SiteConfig.findOne();
    return mergeLandingContent(config?.get('content'));
};

// Seulement les titres et numéros des premières parties (dans la limite réglée), et le nombre des autres
export const findBookToc = async () => {
    const config = await BookConfig.findOne();
    if (!config?.get('showToc')) {
        return {parts: [], hiddenCount: 0};
    }

    const [posts, parts] = await Promise.all([
        Post.findAll({attributes: ['partId'], raw: true}),
        Part.findAll({attributes: ['id', 'title'], order: [['position', 'ASC'], ['id', 'ASC']], raw: true}),
    ]);
    return landingToc(posts, parts, landingTocLimit(config.get('landingTocMaxParts')));
};

export const findImages = async () => {
    //@todo : access control from front only
    return await Attachment.findAll();
};
