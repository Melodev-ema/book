import {defineEventHandler, getHeader} from 'h3';
import {isPublicRoute} from '~/server/utils/isPublicRoute';
import {acceptsBookToken, BOOK_TOKEN_HEADER, hasValidBookToken} from '~/server/utils/bookToken';
import {requireUserSession} from '~/server/utils/session';
import {pdfApiToken} from '~/server/utils/config';
export default defineEventHandler(async (event) => {
    if (isPublicRoute(event.method, event.path)) {
        return;
    }

    // Génération du PDF : la page du livre lit les textes et les parties avec le jeton, sans session
    if (acceptsBookToken(event.method, event.path)
        && hasValidBookToken(getHeader(event, BOOK_TOKEN_HEADER), pdfApiToken())) {
        return;
    }

    await requireUserSession(event);
});
