import {describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
    bookConfig: {
        title: 'Mon livre', author: 'Elodie', years: '2020', dedicationText: '', dedicationAuthor: '', prefaceText: '',
        pageFormat: 'a4', maxLines: 38, maxLinesFirstPage: 32, pageStart: 6, showSignature: true,
        showToc: true, tocPosition: 'start', landingTocMaxParts: 1,
    } as Record<string, unknown>,
}));

vi.mock('~/server/models/bookConfig', () => ({
    default: {findOne: vi.fn(async () => ({...mocks.bookConfig, get: (key: string) => mocks.bookConfig[key], toJSON: () => mocks.bookConfig}))},
}));
vi.mock('~/server/models/siteConfig', () => ({
    default: {findOne: vi.fn(async () => ({get: () => ({pitch: 'Un pitch de test'})}))},
}));
vi.mock('~/server/models/part', () => ({
    default: {findAll: vi.fn(async () => [{id: 1, title: 'Première'}, {id: 2, title: 'Seconde'}])},
}));
vi.mock('~/server/models/post', () => ({
    default: {findAll: vi.fn(async () => [{partId: 1}, {partId: 2}])},
}));
vi.mock('~/server/models/attachment', () => ({
    default: {findAll: vi.fn(async () => [{id: 1, name: 'cover', pageType: 'cover', url: '/c.png', createdAt: new Date('2024-01-01T00:00:00Z')}])},
}));
vi.mock('~/server/utils/db', () => ({default: {sequelize: {}}}));

const {loadLandingData} = await import('./landingData');
const bookConfigGet = (await import('~/server/api/book-config.get')).default;
const siteConfigGet = (await import('~/server/api/site-config.get')).default;
const bookTocGet = (await import('~/server/api/book-toc.get')).default;
const imageGet = (await import('~/server/api/image.get')).default;

// Ce que le client reçoit d'un handler : sa valeur sérialisée en JSON
const viaApi = async (handler: unknown) =>
    JSON.parse(JSON.stringify(await (handler as (event: unknown) => unknown)({})));

describe('loadLandingData', () => {
    it('renvoie les mêmes valeurs que les quatre GET publics', async () => {
        const data = await loadLandingData();

        expect(data.bookConfig).toEqual(await viaApi(bookConfigGet));
        expect(data.siteConfig).toEqual(await viaApi(siteConfigGet));
        expect(data.toc).toEqual(await viaApi(bookTocGet));
        expect(data.imagePages).toEqual(await viaApi(imageGet));
    });

    it('contient bien des données non vides', async () => {
        const data = await loadLandingData();

        expect(data.bookConfig.title).toBe('Mon livre');
        expect(data.siteConfig.pitch).toBe('Un pitch de test');
        expect(data.toc.parts.length).toBeGreaterThan(0);
        expect(data.imagePages).toHaveLength(1);
    });
});
