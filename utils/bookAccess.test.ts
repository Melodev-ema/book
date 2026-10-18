import {describe, expect, it} from 'vitest';
import {canAccessBook} from './bookAccess';

const base = {
    loggedIn: false,
    tokenFromQuery: '',
    expectedToken: 'secret-token' as string | undefined,
};

describe('canAccessBook', () => {
    it('allows a logged-in user without token', () => {
        expect(canAccessBook({...base, loggedIn: true})).toBe(true);
    });

    it('allows the request when the query token matches', () => {
        expect(canAccessBook({...base, tokenFromQuery: 'secret-token'})).toBe(true);
    });

    it('denies the request when the query token is wrong', () => {
        expect(canAccessBook({...base, tokenFromQuery: 'nope'})).toBe(false);
    });

    it('denies a token when the server token is not configured', () => {
        expect(canAccessBook({...base, tokenFromQuery: 'secret-token', expectedToken: undefined})).toBe(false);
    });

    it('denies an empty token when the server token is empty', () => {
        expect(canAccessBook({...base, tokenFromQuery: '', expectedToken: ''})).toBe(false);
    });
});
