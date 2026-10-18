import {beforeAll, describe, expect, it} from 'vitest';
import {createApp, defineEventHandler, toWebHandler} from 'h3';

process.env.SESSION_PASSWORD = 'a'.repeat(32);

const {getSessionUserFromRequest, requireUserSession, setUserSession, getUserSession, clearUserSession} = await import('./session');

const user = {id: 1, email: 'a@b.c', role: 'admin'};

const app = createApp();
app.use('/login', defineEventHandler(async (event) => {
    await setUserSession(event, user);
    return {};
}));
app.use('/me', defineEventHandler(async (event) => getUserSession(event)));
app.use('/require', defineEventHandler(async (event) => requireUserSession(event)));
app.use('/api/session', defineEventHandler(async (event) => {
    const {user} = await getUserSession(event);
    return {loggedIn: !!user, user: user ?? null};
}));
app.use('/logout', defineEventHandler(async (event) => {
    await clearUserSession(event);
    return {};
}));
const handler = toWebHandler(app);

let cookie: string;

beforeAll(async () => {
    const response = await handler(new Request('http://x/login'));
    cookie = response.headers.get('set-cookie')!.split(';')[0];
});

describe('session', () => {
    it('renvoie null sans cookie', async () => {
        expect(await getSessionUserFromRequest(new Request('http://x/'))).toBeNull();
    });

    it('renvoie null pour un cookie illisible', async () => {
        const request = new Request('http://x/', {headers: {cookie: 'livre-session=nimportequoi'}});
        expect(await getSessionUserFromRequest(request)).toBeNull();
    });

    it('relit le user depuis le cookie posé par setUserSession', async () => {
        const request = new Request('http://x/', {headers: {cookie}});
        expect(await getSessionUserFromRequest(request)).toEqual(user);
    });

    it('renvoie null avec un cookie scellé avec un autre mot de passe', async () => {
        const tampered = cookie.slice(0, -4) + 'AAAA';
        const request = new Request('http://x/', {headers: {cookie: tampered}});
        expect(await getSessionUserFromRequest(request)).toBeNull();
    });

    it('getUserSession traite un cookie illisible comme non connecté', async () => {
        const response = await handler(new Request('http://x/me', {headers: {cookie: 'livre-session=nimportequoi'}}));
        expect(await response.json()).toEqual({});
    });

    it('getUserSession renvoie le user avec un cookie valide', async () => {
        const response = await handler(new Request('http://x/me', {headers: {cookie}}));
        expect(await response.json()).toEqual({user});
    });

    it('le cookie est httpOnly et lax', async () => {
        const response = await handler(new Request('http://x/login'));
        const setCookie = response.headers.get('set-cookie')!;
        expect(setCookie).toContain('HttpOnly');
        expect(setCookie).toContain('SameSite=Lax');
        expect(setCookie).toContain('Path=/');
    });

    it('clearUserSession expire le cookie', async () => {
        const response = await handler(new Request('http://x/logout', {headers: {cookie}}));
        expect(response.headers.get('set-cookie')).toMatch(/livre-session=;/);
    });

    it('requireUserSession répond 401 sans cookie et sans en poser', async () => {
        const response = await handler(new Request('http://x/require'));
        expect(response.status).toBe(401);
        expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('requireUserSession répond 401 avec un cookie illisible, sans en poser', async () => {
        const response = await handler(new Request('http://x/require', {headers: {cookie: 'livre-session=nimportequoi'}}));
        expect(response.status).toBe(401);
        expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('GET /api/session sans cookie : non connecté, pas de Set-Cookie', async () => {
        const response = await handler(new Request('http://x/api/session'));
        expect(await response.json()).toEqual({loggedIn: false, user: null});
        expect(response.headers.get('set-cookie')).toBeNull();
    });
});
