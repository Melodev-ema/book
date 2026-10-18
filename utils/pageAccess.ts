import {canAccessBook} from './bookAccess';

export type PageDecision = 'allow' | 'login' | 'unauthorized';

export interface PageAccessContext {
    pathname: string;
    loggedIn: boolean;
    tokenFromQuery: string;
    expectedToken: string | undefined;
}

// Pages lisibles sans session avec le jeton du PDF (/book?token=…)
const BOOK_PAGES = ['/book', '/poem'];

function matches(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function pageAccess(ctx: PageAccessContext): PageDecision {
    const {pathname, loggedIn} = ctx;

    if (matches(pathname, '/admin/login')) {
        return 'allow';
    }

    if (matches(pathname, '/admin')) {
        return loggedIn ? 'allow' : 'login';
    }

    if (BOOK_PAGES.some((page) => matches(pathname, page))) {
        return canAccessBook(ctx) ? 'allow' : 'unauthorized';
    }

    return 'allow';
}
