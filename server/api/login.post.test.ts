import {beforeEach, describe, expect, it, vi} from 'vitest';
import User from '~/server/models/user';
import {verifyPassword} from '~/server/utils/password';
import {setUserSession} from '~/server/utils/session';

vi.mock('~/server/models/user', () => ({
    default: {findOne: vi.fn()},
    UserRole: {ADMIN: 'admin'},
}));

vi.mock('~/server/utils/password', () => ({
    verifyPassword: vi.fn(async () => true),
}));

vi.mock('~/server/utils/session', () => ({
    setUserSession: vi.fn(async () => undefined),
}));

vi.mock('h3', async (orig) => ({
    ...await orig<typeof import('h3')>(),
    readValidatedBody: async (event: {body: unknown}, validate: (body: unknown) => unknown) => validate(event.body),
}));

const {default: handler} = await import('./login.post');

const admin = {
    get: () => ({id: 4, email: 'a@b.fr', role: 'admin', password: '$scrypt$hash', active: true}),
} as never;

const login = (ip: string, email = 'a@b.fr') =>
    handler({body: {email, password: 'motdepasse'}, context: {clientAddress: ip}} as never);

const statusOf = (promise: Promise<unknown>) => promise.then(() => 200, (error) => error.statusCode);

describe('POST /api/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(verifyPassword).mockResolvedValue(true);
    });

    it('ne met dans la session que id, email et role', async () => {
        vi.mocked(User.findOne).mockResolvedValue(admin);

        await login('10.0.0.1');

        expect(setUserSession).toHaveBeenCalledWith(expect.anything(), {id: 4, email: 'a@b.fr', role: 'admin'});
    });

    it('répond pareil pour un email inconnu et un mauvais mot de passe', async () => {
        vi.mocked(User.findOne).mockResolvedValue(null);
        const unknownUser = await login('10.0.0.2').catch((error) => error);

        vi.mocked(User.findOne).mockResolvedValue(admin);
        vi.mocked(verifyPassword).mockResolvedValue(false);
        const wrongPassword = await login('10.0.0.2').catch((error) => error);

        expect(unknownUser.statusCode).toBe(401);
        expect(wrongPassword.statusCode).toBe(401);
        expect(unknownUser.statusMessage).toBe(wrongPassword.statusMessage);
    });

    it('refuse en production le mot de passe par défaut des migrations', async () => {
        const {DEFAULT_ADMIN_HASH} = await import('./login.post');
        vi.mocked(User.findOne).mockResolvedValue({
            get: () => ({id: 1, email: 'admin@admin.com', role: 'admin', password: DEFAULT_ADMIN_HASH}),
        } as never);
        vi.stubEnv('NODE_ENV', 'production');

        try {
            expect(await statusOf(login('10.0.0.5', 'admin@admin.com'))).toBe(401);
            expect(setUserSession).not.toHaveBeenCalled();
        } finally {
            vi.unstubAllEnvs();
        }
    });

    it('bloque une IP après trop d\'échecs, même avec le bon mot de passe', async () => {
        vi.mocked(User.findOne).mockResolvedValue(admin);
        vi.mocked(verifyPassword).mockResolvedValue(false);
        for (let i = 0; i < 10; i++) {
            expect(await statusOf(login('10.0.0.3'))).toBe(401);
        }

        vi.mocked(verifyPassword).mockResolvedValue(true);
        expect(await statusOf(login('10.0.0.3'))).toBe(429);
        expect(await statusOf(login('10.0.0.4'))).toBe(200);
    });
});
