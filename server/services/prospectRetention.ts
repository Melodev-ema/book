import {Op} from 'sequelize';
import Prospect from '~/server/models/prospect';

// Durées annoncées dans la politique de confidentialité (/confidentialite) : à changer aux deux endroits
export const PROSPECT_RETENTION_DAYS = 30;
export const SUBSCRIBER_RETENTION_YEARS = 3;

const DAY = 24 * 60 * 60 * 1000;

// Efface les adresses gardées au-delà de la durée annoncée. Les lignes restent, sans donnée personnelle,
// pour compter les extraits demandés.
// - sans accord pour les nouvelles du livre : 30 jours après la demande ;
// - abonnés : 3 ans après leur dernier contact volontaire (une nouvelle demande d'extrait repousse ce délai).
export async function purgeExpiredProspects(now = new Date()): Promise<{withoutConsent: number; subscribers: number}> {
    const [withoutConsent] = await Prospect.update({email: null}, {
        where: {
            newsletterConsent: false,
            email: {[Op.ne]: null},
            createdAt: {[Op.lt]: new Date(now.getTime() - PROSPECT_RETENTION_DAYS * DAY)},
        },
    });

    const subscriberLimit = new Date(now);
    subscriberLimit.setFullYear(subscriberLimit.getFullYear() - SUBSCRIBER_RETENTION_YEARS);
    const [subscribers] = await Prospect.update({email: null, newsletterConsent: false}, {
        where: {
            newsletterConsent: true,
            email: {[Op.ne]: null},
            lastContactAt: {[Op.lt]: subscriberLimit},
        },
    });

    return {withoutConsent, subscribers};
}
