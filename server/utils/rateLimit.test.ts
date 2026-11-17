import {describe, expect, it} from 'vitest';
import {createRateLimiter} from './rateLimit';

describe('createRateLimiter', () => {
    it('accepte jusqu\'à la limite puis refuse', () => {
        const now = 0;
        const limiter = createRateLimiter({max: 2, windowMs: 1000, now: () => now});

        expect(limiter.hit('a')).toBe(true);
        expect(limiter.hit('a')).toBe(true);
        expect(limiter.hit('a')).toBe(false);
    });

    it('compte chaque clé à part', () => {
        const limiter = createRateLimiter({max: 1, windowMs: 1000, now: () => 0});

        expect(limiter.hit('a')).toBe(true);
        expect(limiter.hit('b')).toBe(true);
        expect(limiter.hit('a')).toBe(false);
    });

    it('repart de zéro après la fenêtre', () => {
        let now = 0;
        const limiter = createRateLimiter({max: 1, windowMs: 1000, now: () => now});

        expect(limiter.hit('a')).toBe(true);
        now = 1001;
        expect(limiter.hit('a')).toBe(true);
    });

    it('reset efface le compteur d\'une clé', () => {
        const limiter = createRateLimiter({max: 1, windowMs: 1000, now: () => 0});

        limiter.hit('a');
        limiter.reset('a');
        expect(limiter.hit('a')).toBe(true);
    });

    it('oublie les entrées expirées, même sans nouvelle demande de la même clé', () => {
        let now = 0;
        const limiter = createRateLimiter({max: 1, windowMs: 1000, now: () => now});

        limiter.hit('10.0.0.1');
        limiter.hit('lecteur@exemple.fr');
        expect(limiter.size()).toBe(2);

        now = 61_000;
        limiter.hit('autre');
        expect(limiter.size()).toBe(1);
    });

    it('ne garde pas les clés en clair (IP, adresses e-mail)', () => {
        const limiter = createRateLimiter({max: 1, windowMs: 1000, now: () => 0});
        limiter.hit('lecteur@exemple.fr');
        expect(limiter.keys().join(' ')).not.toContain('lecteur');
    });
});
