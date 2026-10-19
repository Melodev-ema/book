import {defineMiddleware} from 'astro:middleware';
import {getSessionUserFromRequest} from '~/server/utils/session';
import {pdfApiToken} from '~/server/utils/config';
import {pageAccess} from '~/utils/pageAccess';
import {assertProductionEnv} from '~/server/utils/env';

export const onRequest = defineMiddleware(async (context, next) => {
    assertProductionEnv();

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
});
