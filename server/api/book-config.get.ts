import {defineEventHandler} from 'h3';
import BookConfig from "~/server/models/bookConfig";

export default defineEventHandler(async () => {
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
});
