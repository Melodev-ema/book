import {describe, expect, it} from 'vitest';
import {securityHeaders} from './securityHeaders';

describe('securityHeaders', () => {
    it('interdit l\'affichage en iframe et le reniflage de type partout', () => {
        expect(securityHeaders('/')).toMatchObject({'x-frame-options': 'DENY', 'x-content-type-options': 'nosniff'});
    });

    it('exclut l\'admin, le livre et l\'API des moteurs de recherche, pas la landing', () => {
        expect(securityHeaders('/admin/content')['x-robots-tag']).toBe('noindex, nofollow');
        expect(securityHeaders('/book')['x-robots-tag']).toBe('noindex, nofollow');
        expect(securityHeaders('/api/post')['x-robots-tag']).toBe('noindex, nofollow');
        expect(securityHeaders('/')['x-robots-tag']).toBeUndefined();
        expect(securityHeaders('/bookmark')['x-robots-tag']).toBeUndefined();
    });
});
