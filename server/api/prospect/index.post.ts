import {defineEventHandler, createError, readValidatedBody} from 'h3';
import Prospect from "~/server/models/prospect";
import {z} from "zod";
import {sendSiteMail} from "~/server/services/sendSiteMail";
import {clientIp, createRateLimiter, tooManyRequests} from "~/server/utils/rateLimit";

const bodySchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    // Case « recevoir les nouvelles du livre », non cochée par défaut
    newsletterConsent: z.boolean().optional().default(false),
});

// Route publique qui génère un PDF et envoie un email : limitée par IP, par adresse et au total
const HOUR = 60 * 60 * 1000;
const perIp = createRateLimiter({max: 3, windowMs: HOUR});
const perEmail = createRateLimiter({max: 1, windowMs: 24 * HOUR});
const overall = createRateLimiter({max: 60, windowMs: HOUR});

// Résumé d'une erreur sans son message : ceux de la base et du serveur SMTP peuvent contenir l'adresse du visiteur,
// qui ne doit pas finir dans les logs
function describeError(error: unknown): string {
    const {name, code, responseCode} = (error ?? {}) as {name?: string; code?: string; responseCode?: number};
    return [name, code, responseCode && `SMTP ${responseCode}`].filter(Boolean).join(', ') || 'erreur inconnue';
}

export default defineEventHandler(async (event) => {
    if (!perIp.hit(clientIp(event))) {
        tooManyRequests();
    }

    const {email, newsletterConsent} = await readValidatedBody(event, bodySchema.parse);

    if (!perEmail.hit(email) || !overall.hit('all')) {
        tooManyRequests();
    }

    // Chaque demande est un contact volontaire : elle repousse les 3 ans de conservation d'un abonnement existant
    const now = new Date();
    try {
        await Prospect.update({lastContactAt: now}, {where: {email, newsletterConsent: true}});
        await Prospect.create({email, newsletterConsent, consentAt: newsletterConsent ? now : null, lastContactAt: now});
    } catch (error) {
        console.error(`Enregistrement du prospect impossible (${describeError(error)})`);
        perEmail.reset(email);
        throw createError({statusCode: 500, statusMessage: 'Erreur lors de l\'enregistrement'});
    }

    try {
        await sendSiteMail({to: email});
    } catch (error) {
        console.error(`Envoi de l'extrait impossible (${describeError(error)})`);
        // L'adresse pourra redemander l'extrait
        perEmail.reset(email);
        throw createError({statusCode: 500, statusMessage: 'Erreur lors de l\'envoi de l\'email'});
    }

    return {message: 'Email envoyé avec succès'};
});
