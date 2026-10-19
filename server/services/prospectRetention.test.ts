import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Op} from 'sequelize';
import Prospect from '~/server/models/prospect';
import {purgeExpiredProspects} from './prospectRetention';

vi.mock('~/server/models/prospect', () => ({default: {update: vi.fn()}}));

type UpdateCall = [object, {where: Record<string, unknown>}];
const calls = () => vi.mocked(Prospect.update).mock.calls as unknown as UpdateCall[];

describe('purgeExpiredProspects', () => {
    const now = new Date('2026-10-31T12:00:00Z');

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(Prospect.update).mockResolvedValueOnce([2] as never).mockResolvedValueOnce([1] as never);
    });

    it('renvoie le nombre d\'adresses effacées de chaque sorte', async () => {
        expect(await purgeExpiredProspects(now)).toEqual({withoutConsent: 2, subscribers: 1});
    });

    it('efface l\'adresse des prospects sans accord demandés il y a plus de 30 jours, sans supprimer la demande', async () => {
        await purgeExpiredProspects(now);

        const [values, {where}] = calls()[0];
        expect(values).toEqual({email: null});
        expect(where.newsletterConsent).toBe(false);
        expect(where.email).toEqual({[Op.ne]: null});
        expect(where.createdAt).toEqual({[Op.lt]: new Date('2026-10-01T12:00:00Z')});
    });

    it('efface les abonnés sans contact depuis 3 ans et retire leur accord', async () => {
        await purgeExpiredProspects(now);

        const [values, {where}] = calls()[1];
        expect(values).toEqual({email: null, newsletterConsent: false});
        expect(where.newsletterConsent).toBe(true);
        expect(where.lastContactAt).toEqual({[Op.lt]: new Date('2023-10-31T12:00:00Z')});
    });
});
