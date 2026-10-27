import {defineMiddleware} from 'astro:middleware';
import type {MiddlewareHandler} from 'astro';
import {getSessionUserFromRequest} from '~/server/utils/session';
import {pdfApiToken} from '~/server/utils/config';
import {pageAccess} from '~/utils/pageAccess';
import {assertProductionEnv} from '~/server/utils/env';
import {securityHeaders} from '~/utils/securityHeaders';

export const onRequest = defineMiddleware(async (context, next) => {
    assertProductionEnv();

    // Copie : certaines réponses (redirections, fetch) ont des en-têtes en lecture seule
    const original = await route(context, next);
    const response = new Response(original.body, original);
    for (const [name, value] of Object.entries(securityHeaders(context.url.pathname))) {
        response.headers.set(name, value);
    }
    return response;
});

const route = async (...[context, next]: Parameters<MiddlewareHandler>): Promise<Response> => {
    const {pathname, searchParams} = context.url;

    // L'API gère elle-même ses accès
    if (pathname === '/api' || pathname.startsWith('/api/')) {
        return next();
    }

    const user = await getSessionUserFromRequest(context.request);
    context.locals.user = user;

    const decision = pageAccess({
        pathname,
        loggedIn: !!user,
        tokenFromQuery: searchParams.get('token') || '',
        expectedToken: pdfApiToken(),
    });

    if (decision === 'login') {
        return context.redirect('/admin/login');
    }

    if (decision === 'unauthorized') {
        return new Response('Unauthorized', {status: 401});
    }

    return next();
};
