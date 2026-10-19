import {defineEventHandler, createError, readValidatedBody} from 'h3';
import {z} from 'zod';
import User, {UserRole} from "~/server/models/user";
import {verifyPassword} from "~/server/utils/password";
import {setUserSession} from "~/server/utils/session";
import {clientIp, createRateLimiter, tooManyRequests} from "~/server/utils/rateLimit";

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

// 10 tentatives par IP et par quart d'heure ; une connexion réussie remet le compteur à zéro
const attempts = createRateLimiter({max: 10, windowMs: 15 * 60 * 1000});

// Mot de passe du compte admin@admin.com créé par les migrations (connu de tous : refusé en production).
// Vérifié aussi quand l'email est inconnu : la réponse prend le même temps (pas d'énumération des comptes).
export const DEFAULT_ADMIN_HASH = '$scrypt$n=16384,r=8,p=1$vTXHwMqvSo4ZrnE6ODvdVw$RRfbQPB56mZlappZwZTDG85AEf6t1BoSTWo0sWQW05nzQZrHmYuAmQECIoksTRODDcC2gLo7+7y336vDSPsCAQ';

export default defineEventHandler(async (event) => {
    const ip = clientIp(event);
    if (!attempts.hit(ip)) {
        tooManyRequests();
    }

    const {email, password} = await readValidatedBody(event, bodySchema.parse);

    const user = await User.findOne({
        where: {
            email: email,
            active: true,
            role: UserRole.ADMIN
        },
    });

    const plain = user?.get({plain: true});
    const valid = await verifyPassword(plain?.password ?? DEFAULT_ADMIN_HASH, password);

    if (plain && valid && plain.password === DEFAULT_ADMIN_HASH && process.env.NODE_ENV === 'production') {
        console.warn('Connexion refusée : mot de passe par défaut. Changez-le avec npm run admin:password');
        throw createError({statusCode: 401, statusMessage: 'Identifiants incorrects'});
    }

    if (plain && valid) {
        attempts.reset(ip);
        await setUserSession(event, {id: plain.id, email: plain.email, role: plain.role});
        return {};
    }

    throw createError({statusCode: 401, statusMessage: 'Identifiants incorrects'});
});
