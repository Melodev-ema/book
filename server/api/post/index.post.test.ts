import {beforeEach, describe, expect, it, vi} from 'vitest';
import Post from '~/server/models/post';

vi.mock('~/server/models/post', () => ({
    default: {
        create: vi.fn(async (values: object) => values),
        findByPk: vi.fn(async () => ({id: 1})),
        update: vi.fn(async () => [1]),
    },
}));

vi.mock('h3', async (orig) => ({
    ...await orig<typeof import('h3')>(),
    readBody: async (event: {body: unknown}) => event.body,
}));

vi.mock('~/server/utils/session', () => ({
    requireUserSession: vi.fn(async () => ({})),
}));

const {default: handler} = await import('./index.post');

const dangerous = '<p>vers</p><img src="x" onerror="alert(1)"><script>alert(2)</script>';

describe('POST /api/post', () => {
    beforeEach(() => vi.clearAllMocks());

    it('enregistre un nouveau texte nettoyé', async () => {
        await handler({body: {postTitle: 'Titre', author: 'A', content: dangerous}});

        const {content} = vi.mocked(Post.create).mock.calls[0][0] as {content: unknown};
        expect(content).toBe('<p>vers</p><img src="x">');
    });

    it('enregistre une modification nettoyée', async () => {
        await handler({body: {id: 1, postTitle: 'Titre', content: dangerous}});

        const {content} = vi.mocked(Post.update).mock.calls[0][0] as {content: unknown};
        expect(content).toBe('<p>vers</p><img src="x">');
    });
});
