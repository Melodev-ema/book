import {beforeEach, describe, expect, it, vi} from 'vitest';
import Post from '~/server/models/post';

const existing = vi.hoisted(() => ({id: 1, update: vi.fn<(values: object) => Promise<void>>(async () => undefined)}));

vi.mock('~/server/models/post', () => ({
    default: {
        create: vi.fn(async (values: object) => values),
        findByPk: vi.fn(async () => existing),
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
        await handler({body: {postTitle: 'Titre', author: 'A', content: dangerous}} as never);

        const {content} = vi.mocked(Post.create).mock.calls[0][0] as {content: unknown};
        expect(content).toBe('<p>vers</p><img src="x">');
    });

    it('enregistre une modification nettoyée', async () => {
        await handler({body: {id: 1, postTitle: 'Titre', content: dangerous}} as never);

        const {content} = existing.update.mock.lastCall![0] as {content: unknown};
        expect(content).toBe('<p>vers</p><img src="x">');
    });

    it('modifie l\'auteur seulement s\'il est envoyé', async () => {
        await handler({body: {id: 1, postTitle: 'Titre', content: 'x'}} as never);
        expect(existing.update.mock.lastCall![0]).not.toHaveProperty('author');

        await handler({body: {id: 1, postTitle: 'Titre', author: 'Nouvel auteur', content: 'x'}} as never);
        expect(existing.update.mock.lastCall![0]).toHaveProperty('author', 'Nouvel auteur');
    });
});
