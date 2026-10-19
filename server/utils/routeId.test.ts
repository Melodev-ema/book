import {describe, expect, it} from 'vitest';
import {routeId} from './routeId';

const event = (id: string) => ({context: {params: {id}}}) as never;

describe('routeId', () => {
    it('renvoie l\'identifiant numérique', () => {
        expect(routeId(event('12'), 'introuvable')).toBe(12);
    });

    it('répond 404 pour un identifiant non numérique', () => {
        for (const id of ['abc', '1.5', '-3', '']) {
            expect(() => routeId(event(id), 'introuvable')).toThrow(expect.objectContaining({statusCode: 404}));
        }
    });
});
