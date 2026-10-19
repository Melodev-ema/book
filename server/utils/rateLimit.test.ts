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
});
