import {describe, expect, it} from 'vitest';
import {pageAccess} from './pageAccess';

const base = {
    pathname: '/',
    loggedIn: false,
    tokenFromQuery: '',
    expectedToken: 't' as string | undefined,
};

describe('pageAccess', () => {
    it('allows the home page without session', () => {
        expect(pageAccess({...base, pathname: '/'})).toBe('allow');
    });

    it('allows the login page without session', () => {
        expect(pageAccess({...base, pathname: '/admin/login'})).toBe('allow');
    });

    it.each(['/admin', '/admin/content/12/edit', '/admin/book'])('sends %s to login without session', (pathname) => {
        expect(pageAccess({...base, pathname})).toBe('login');
    });

    // Rechargement d'une URL admin profonde : le serveur doit servir l'appli admin
    it('allows a deep admin URL when logged in', () => {
        expect(pageAccess({...base, pathname: '/admin/content/12/edit', loggedIn: true})).toBe('allow');
    });

    it.each(['/book'])('denies %s without session nor token', (pathname) => {
        expect(pageAccess({...base, pathname})).toBe('unauthorized');
    });

    it.each(['/book'])('denies %s with a wrong token', (pathname) => {
        expect(pageAccess({...base, pathname, tokenFromQuery: 'faux'})).toBe('unauthorized');
    });

    // Puppeteer charge /book?token=… sans cookie pour générer le PDF
    it('allows /book with the right token', () => {
        expect(pageAccess({...base, pathname: '/book', tokenFromQuery: 't'})).toBe('allow');
    });

    it('denies /book when no token is configured', () => {
        expect(pageAccess({...base, pathname: '/book', tokenFromQuery: '', expectedToken: undefined})).toBe('unauthorized');
    });
});
