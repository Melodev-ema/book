import {createError, getRequestIP, type H3Event} from 'h3';

// Limiteur en mémoire (une seule instance du serveur) : au plus `max` appels par clé sur `windowMs`
export function createRateLimiter({max, windowMs, now = Date.now}: {max: number; windowMs: number; now?: () => number}) {
    const hits = new Map<string, {count: number; resetAt: number}>();

    return {
        hit(key: string): boolean {
            const time = now();
            // Purge les fenêtres expirées pour ne pas grossir indéfiniment
            if (hits.size > 10_000) {
                for (const [k, entry] of hits) {
                    if (entry.resetAt <= time) {
                        hits.delete(k);
                    }
                }
            }

            const entry = hits.get(key);
            if (!entry || entry.resetAt <= time) {
                hits.set(key, {count: 1, resetAt: time + windowMs});
                return true;
            }
            entry.count++;
            return entry.count <= max;
        },
        reset(key: string): void {
            hits.delete(key);
        },
    };
}

// IP transmise par Astro (X-Forwarded-For n'est pris en compte que si SITE_DOMAIN est configuré)
export function clientIp(event: H3Event): string {
    return getRequestIP(event) ?? 'inconnue';
}

export function tooManyRequests(): never {
    throw createError({statusCode: 429, statusMessage: 'Trop de tentatives, réessayez plus tard'});
}
