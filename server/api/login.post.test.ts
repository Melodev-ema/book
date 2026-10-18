import {beforeEach, describe, expect, it, vi} from 'vitest';
import User from '~/server/models/user';
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

describe('POST /api/login', () => {
    beforeEach(() => vi.clearAllMocks());

    it('ne met dans la session que id, email et role', async () => {
        vi.mocked(User.findOne).mockResolvedValue({
            get: () => ({id: 4, email: 'a@b.fr', role: 'admin', password: '$scrypt$hash', active: true}),
        } as never);

        await handler({body: {email: 'a@b.fr', password: 'motdepasse'}} as never);

        expect(setUserSession).toHaveBeenCalledWith(expect.anything(), {id: 4, email: 'a@b.fr', role: 'admin'});
    });
});
