// Safety net for the admin API: any /api/* route not explicitly public below
// requires a logged-in session, even if a handler forgets to check itself.
// /api/v1/* is excluded: it has its own token-based middleware (jwt-authenticated.ts).
export const PUBLIC_ROUTES = new Set([
    'GET /api/book-config',
    'GET /api/book-toc',
    'GET /api/image',
    'POST /api/login',
    'POST /api/prospect',
    'GET /api/site-config',
    'GET /api/session',
]);

export function isPublicRoute(method: string, path: string): boolean {
    if (!path.startsWith('/api/') || path.startsWith('/api/v1/')) {
        return true;
    }

    const pathname = path.split('?')[0];
    return PUBLIC_ROUTES.has(`${method} ${pathname}`);
}
