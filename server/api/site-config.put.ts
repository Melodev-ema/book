import {defineEventHandler, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import SiteConfig from "~/server/models/siteConfig";
import {mergeLandingContent} from "~/utils/landingContent";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const body = await readBody(event);
    const current = mergeLandingContent((await SiteConfig.findOne())?.get('content'));

    // Normalise le contenu reçu (seules les clés connues sont conservées).
    // La photo ne change que via /api/site-portrait : on garde celle déjà enregistrée.
    const received = mergeLandingContent(body);
    const content = {...received, author: {...received.author, portraitUrl: current.author.portraitUrl}};

    await SiteConfig.upsert({
        id: 1,
        content,
    });

    return content;
});
