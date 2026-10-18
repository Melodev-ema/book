import {defineEventHandler, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import BookConfig from "~/server/models/bookConfig";
import {landingTocLimit} from "~/utils/bookToc";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const body = await readBody(event);

    await BookConfig.upsert({
        id: 1,
        ...body,
        // Un champ vidé ou à 0 ne doit pas faire échouer tout l'enregistrement
        ...(body && 'landingTocMaxParts' in body ? {landingTocMaxParts: landingTocLimit(body.landingTocMaxParts)} : {}),
    });

    return await BookConfig.findOne();
});
