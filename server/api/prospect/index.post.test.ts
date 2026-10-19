import {beforeEach, describe, expect, it, vi} from 'vitest';
import Prospect from '~/server/models/prospect';
import {sendSiteMail} from '~/server/services/sendSiteMail';

vi.mock('~/server/models/prospect', () => ({default: {create: vi.fn(async () => ({}))}}));
vi.mock('~/server/services/sendSiteMail', () => ({sendSiteMail: vi.fn(async () => undefined)}));

vi.mock('h3', async (orig) => ({
    ...await orig<typeof import('h3')>(),
    readValidatedBody: async (event: {body: unknown}, validate: (body: unknown) => unknown) => validate(event.body),
}));

const {default: handler} = await import('./index.post');

const ask = (ip: string, email: string) =>
    handler({body: {email}, context: {clientAddress: ip}} as never).then(() => 200, (error) => error.statusCode);

describe('POST /api/prospect', () => {
    beforeEach(() => vi.clearAllMocks());

    it('enregistre le prospect et envoie l\'extrait', async () => {
        expect(await ask('10.1.0.1', 'lecteur@exemple.fr')).toBe(200);
        expect(Prospect.create).toHaveBeenCalledWith({email: 'lecteur@exemple.fr', newsletterConsent: false, consentAt: null});
        expect(sendSiteMail).toHaveBeenCalledWith({to: 'lecteur@exemple.fr'});
    });

    it('enregistre l\'accord pour les nouvelles du livre, avec sa date', async () => {
        await handler({body: {email: 'oui@exemple.fr', newsletterConsent: true}, context: {clientAddress: '10.1.0.6'}} as never);
        expect(Prospect.create).toHaveBeenCalledWith({email: 'oui@exemple.fr', newsletterConsent: true, consentAt: expect.any(Date)});
    });

    it('n\'envoie l\'extrait qu\'une fois par jour à la même adresse', async () => {
        expect(await ask('10.1.0.2', 'deux@exemple.fr')).toBe(200);
        expect(await ask('10.1.0.3', 'DEUX@exemple.fr')).toBe(429);
        expect(sendSiteMail).toHaveBeenCalledTimes(1);
    });

    it('limite les demandes d\'une même IP', async () => {
        for (let i = 0; i < 3; i++) {
            expect(await ask('10.1.0.4', `ip${i}@exemple.fr`)).toBe(200);
        }
        expect(await ask('10.1.0.4', 'ip3@exemple.fr')).toBe(429);
    });

    it('répond 500 si l\'envoi échoue', async () => {
        vi.mocked(sendSiteMail).mockRejectedValueOnce(new Error('SMTP indisponible'));
        expect(await ask('10.1.0.5', 'echec@exemple.fr')).toBe(500);
    });
});
