import {beforeAll, describe, expect, it, vi} from 'vitest';
import {createApp, defineEventHandler, toWebHandler} from 'h3';

process.env.SESSION_PASSWORD = 'a'.repeat(32);
process.env.PDF_API_TOKEN = 'jeton-pdf-de-test';

const pdfBuffer = Buffer.from('%PDF-1.4 faux pdf');

const mocks = vi.hoisted(() => ({
    attachmentCreate: vi.fn(),
    generatePdf: vi.fn(),
    writeFile: vi.fn<(path: string, data: unknown) => Promise<void>>(async () => undefined),
}));

// Les modèles Sequelize et le générateur de PDF sont remplacés : aucune base ni navigateur
vi.mock('~/server/models/post', () => ({default: {findAndCountAll: vi.fn(async () => ({count: 0, rows: []})), findByPk: vi.fn()}}));
vi.mock('~/server/models/part', () => ({default: {findAll: vi.fn(async () => []), findAndCountAll: vi.fn(async () => ({count: 0, rows: []}))}}));
vi.mock('~/server/models/apiToken', () => ({default: {findOne: vi.fn(async () => null), findAll: vi.fn(async () => [])}}));
vi.mock('~/server/models/siteConfig', () => ({default: {findOne: vi.fn(async () => null)}}));
vi.mock('~/server/models/bookConfig', () => ({default: {findOne: vi.fn(async () => null)}}));
vi.mock('~/server/models/prospect', () => ({default: {create: vi.fn()}}));
vi.mock('~/server/models/user', () => ({default: {findOne: vi.fn(async () => null)}}));
vi.mock('~/server/models/attachment', () => ({
    default: {
        findOne: vi.fn(async () => null),
        findAll: vi.fn(async () => []),
        create: mocks.attachmentCreate,
        update: vi.fn(),
    },
}));
vi.mock('~/server/utils/db', () => ({default: {sequelize: {transaction: vi.fn()}}}));
vi.mock('~/server/services/sendSiteMail', () => ({sendSiteMail: vi.fn()}));
vi.mock('~/server/services/bookPdfGenerator', () => ({generatePdfFromEvent: mocks.generatePdf}));
// L'écriture du fichier téléversé ne doit pas toucher le disque
vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    const fake = {...actual, mkdir: vi.fn(async () => undefined), writeFile: mocks.writeFile, unlink: vi.fn(async () => undefined)};
    return {...fake, default: fake};
});

const {setUserSession} = await import('./utils/session');
const {apiWebHandler} = await import('./app');

// Fabrique un cookie de session valide avec une mini app h3
const loginApp = createApp();
loginApp.use(defineEventHandler(async (event) => {
    await setUserSession(event, {id: 1, email: 'a@b.c', role: 'admin'});
    return {};
}));

let cookie: string;

beforeAll(async () => {
    const response = await toWebHandler(loginApp)(new Request('http://x/'));
    cookie = response.headers.get('set-cookie')!.split(';')[0];
});

describe('application h3 de l\'API', () => {
    it('GET /api/stats sans cookie répond 401', async () => {
        const response = await apiWebHandler(new Request('http://x/api/stats'));
        expect(response.status).toBe(401);
    });

    it('GET /api/site-config est public et atteint son handler', async () => {
        const response = await apiWebHandler(new Request('http://x/api/site-config'));
        expect(response.status).not.toBe(401);
    });

    it('POST /api/v1/post sans Authorization répond 401', async () => {
        const response = await apiWebHandler(new Request('http://x/api/v1/post', {method: 'POST'}));
        expect(response.status).toBe(401);
    });

    it('GET /api/post?limit=all accepte x-book-token sans session', async () => {
        const response = await apiWebHandler(new Request('http://x/api/post?limit=all', {
            headers: {'x-book-token': process.env.PDF_API_TOKEN!},
        }));
        expect(response.status).not.toBe(401);
    });

    it('GET /api/post?limit=all sans jeton ni session répond 401', async () => {
        const response = await apiWebHandler(new Request('http://x/api/post?limit=all'));
        expect(response.status).toBe(401);
    });

    it('POST /api/generate-pdf renvoie un PDF binaire', async () => {
        mocks.generatePdf.mockResolvedValue(pdfBuffer);
        const response = await apiWebHandler(new Request('http://x/api/generate-pdf', {
            method: 'POST',
            headers: {cookie},
        }));
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('application/pdf');
        expect((await response.arrayBuffer()).byteLength).toBe(pdfBuffer.length);
    });

    const PNG = [0x89, 0x50, 0x4e, 0x47, 1, 2];
    const uploadImage = (bytes: number[], filename: string, pageType: string) => {
        const form = new FormData();
        form.append('file', new File([new Uint8Array(bytes)], filename, {type: 'image/png'}));
        form.append('data', pageType);
        return apiWebHandler(new Request('http://x/api/import/image', {method: 'POST', headers: {cookie}, body: form}));
    };

    it('POST /api/import/image enregistre l\'image sous un nom choisi par le serveur', async () => {
        const response = await uploadImage(PNG, '../../server/app.ts', 'cover');

        expect(response.status).toBe(200);
        expect(mocks.attachmentCreate).toHaveBeenCalledWith(expect.objectContaining({size: 6, pageType: 'cover'}));
        const writtenPath = mocks.writeFile.mock.lastCall![0] as string;
        expect(writtenPath).toMatch(/public\/uploads\/cover-\d+\.png$/);
    });

    it('POST /api/import/image refuse un fichier qui n\'est pas une image', async () => {
        expect((await uploadImage([0x3c, 0x68, 0x74, 0x6d], 'page.png', 'cover')).status).toBe(400);
    });

    it('POST /api/import/image refuse un emplacement inconnu', async () => {
        expect((await uploadImage(PNG, 'a.png', '../evil')).status).toBe(400);
    });
});
