import {defineEventHandler, readBody} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import BookConfig from "~/server/models/bookConfig";
import {landingTocLimit} from "~/utils/bookToc";

// Seuls les réglages du livre sont modifiables (ni id, ni dates)
const EDITABLE_FIELDS = [
    'title', 'author', 'years', 'dedicationText', 'dedicationAuthor', 'prefaceText', 'pageFormat',
    'maxLines', 'maxLinesFirstPage', 'pageStart', 'showSignature', 'showToc', 'tocPosition', 'landingTocMaxParts',
];

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const body = await readBody(event) ?? {};
    const fields = Object.fromEntries(EDITABLE_FIELDS.filter((field) => field in body).map((field) => [field, body[field]]));

    await BookConfig.upsert({
        ...fields,
        // Un champ vidé ou à 0 ne doit pas faire échouer tout l'enregistrement
        ...('landingTocMaxParts' in fields ? {landingTocMaxParts: landingTocLimit(fields.landingTocMaxParts)} : {}),
        id: 1,
    });

    return await BookConfig.findOne();
});
