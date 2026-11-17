import {createHash} from 'node:crypto';
import {createError, getRequestIP, type H3Event} from 'h3';

// Les clés (IP, adresses e-mail) ne sont gardées que sous forme d'empreinte
const fingerprint = (key: string) => createHash('sha256').update(key).digest('base64url');

// Nettoyage des entrées expirées au plus une fois par minute
const SWEEP_INTERVAL_MS = 60_000;

// Limiteur en mémoire (une seule instance du serveur) : au plus `max` appels par clé sur `windowMs`.
// Une entrée est oubliée dès que sa fenêtre est passée : la politique de confidentialité annonce
// que l'IP et l'adresse e-mail ne restent en mémoire que 24 heures au plus.
export function createRateLimiter({max, windowMs, now = Date.now}: {max: number; windowMs: number; now?: () => number}) {
    const hits = new Map<string, {count: number; resetAt: number}>();
    let lastSweep = now();

    function sweep(time: number) {
        if (time - lastSweep < SWEEP_INTERVAL_MS) {
            return;
        }
        lastSweep = time;
        for (const [key, entry] of hits) {
            if (entry.resetAt <= time) {
                hits.delete(key);
            }
        }
    }

    // Aussi sans nouvelle demande : un site calme ne doit pas garder d'entrée au-delà de sa fenêtre.
    // unref : ce minuteur n'empêche pas le serveur de s'arrêter.
    setInterval(() => sweep(now()), SWEEP_INTERVAL_MS).unref();

    return {
        hit(key: string): boolean {
            const time = now();
            sweep(time);

            const id = fingerprint(key);
            const entry = hits.get(id);
            if (!entry || entry.resetAt <= time) {
                hits.set(id, {count: 1, resetAt: time + windowMs});
                return true;
            }
            entry.count++;
            return entry.count <= max;
        },
        reset(key: string): void {
            hits.delete(fingerprint(key));
        },
        // Pour les tests
        size: () => hits.size,
        keys: () => [...hits.keys()],
    };
}

// IP transmise par Astro (X-Forwarded-For n'est pris en compte que si SITE_DOMAIN est configuré)
export function clientIp(event: H3Event): string {
    return getRequestIP(event) ?? 'inconnue';
}

export function tooManyRequests(): never {
    throw createError({statusCode: 429, statusMessage: 'Trop de tentatives, réessayez plus tard'});
}
