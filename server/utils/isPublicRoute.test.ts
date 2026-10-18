import {describe, expect, it} from 'vitest';
import {isPublicRoute} from './isPublicRoute';

describe('isPublicRoute', () => {
    it('lets non-api routes through', () => {
        expect(isPublicRoute('GET', '/book')).toBe(true);
    });

    it('lets /api/v1/* through (protected by its own token middleware)', () => {
        expect(isPublicRoute('POST', '/api/v1/post')).toBe(true);
    });

    it.each([
        ['GET', '/api/book-config'],
        ['GET', '/api/book-toc'],
        ['GET', '/api/image'],
        ['POST', '/api/login'],
        ['POST', '/api/prospect'],
        ['GET', '/api/site-config'],
        ['GET', '/api/session'],
    ])('treats %s %s as public', (method, path) => {
        expect(isPublicRoute(method, path)).toBe(true);
    });

    it('ignores the query string when matching', () => {
        expect(isPublicRoute('GET', '/api/image?id=3')).toBe(true);
    });

    it.each([
        ['GET', '/api/post'],
        ['GET', '/api/post?limit=all'],
        ['GET', '/api/post/1'],
        ['POST', '/api/post'],
        ['PUT', '/api/post/order'],
        ['GET', '/api/part'],
        ['POST', '/api/part'],
        ['PUT', '/api/part/order'],
        ['DELETE', '/api/part/1'],
        ['PUT', '/api/book-config'],
        ['PUT', '/api/site-config'],
        ['POST', '/api/site-portrait'],
        ['DELETE', '/api/session'],
        ['GET', '/api/stats'],
        ['POST', '/api/generate-pdf'],
        ['GET', '/api/config/api-token'],
        ['POST', '/api/import'],
        ['GET', '/api/import/queue'],
    ])('requires a session for %s %s', (method, path) => {
        expect(isPublicRoute(method, path)).toBe(false);
    });

    it('is method-sensitive: GET being public does not make PUT public', () => {
        expect(isPublicRoute('GET', '/api/book-config')).toBe(true);
        expect(isPublicRoute('PUT', '/api/book-config')).toBe(false);
    });
});
