import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {apiFetch, apiTry, ApiError} from './api';

function mockFetch(response: Partial<Response> & {json?: () => Promise<unknown>}) {
    const fn = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fn);
    return fn;
}

function jsonResponse(status: number, data: unknown) {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({'content-type': 'application/json'}),
        json: async () => data,
    };
}

beforeEach(() => {
    vi.stubGlobal('window', {});
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('apiFetch', () => {
    it('sends a plain body as JSON', async () => {
        const fn = mockFetch(jsonResponse(200, {ok: true}));
        await apiFetch('/api/x', {method: 'POST', body: {a: 1}});
        const [, init] = fn.mock.calls[0];
        expect(init.body).toBe('{"a":1}');
        expect(init.headers['content-type']).toBe('application/json');
        expect(init.method).toBe('POST');
    });

    it('sends FormData as is, without content-type', async () => {
        const fn = mockFetch(jsonResponse(200, {}));
        const form = new FormData();
        form.append('file', 'x');
        await apiFetch('/api/x', {method: 'POST', body: form});
        const [, init] = fn.mock.calls[0];
        expect(init.body).toBe(form);
        expect(init.headers['content-type']).toBeUndefined();
    });

    it('builds the query string', async () => {
        const fn = mockFetch(jsonResponse(200, {}));
        await apiFetch('/api/x', {query: {limit: 'all', page: 2}});
        expect(fn.mock.calls[0][0]).toBe('/api/x?limit=all&page=2');
    });

    it('throws an ApiError on a non-OK response', async () => {
        mockFetch(jsonResponse(401, {message: 'no'}));
        const error = await apiFetch('/api/x').catch((e) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(401);
        expect(error.data).toEqual({message: 'no'});
    });

    it('does not append a trailing ? for an empty query', async () => {
        const fn = mockFetch(jsonResponse(200, {}));
        await apiFetch('/api/x', {query: {}});
        expect(fn.mock.calls[0][0]).toBe('/api/x');
    });

    it('throws a clear error outside the browser', async () => {
        vi.stubGlobal('window', undefined);
        await expect(apiFetch('/api/x')).rejects.toThrow('apiFetch est réservé au navigateur');
    });

    it('returns a blob for a non-JSON response', async () => {
        const blob = new Blob(['pdf']);
        mockFetch({ok: true, status: 200, headers: new Headers({'content-type': 'application/pdf'}), blob: async () => blob});
        expect(await apiFetch('/api/x')).toBe(blob);
    });
});

describe('apiTry', () => {
    it('returns the data on success', async () => {
        mockFetch(jsonResponse(200, {a: 1}));
        expect(await apiTry('/api/x')).toEqual({data: {a: 1}, error: null});
    });

    it('returns the error without throwing on a 500', async () => {
        mockFetch(jsonResponse(500, {}));
        const {data, error} = await apiTry('/api/x');
        expect(data).toBeNull();
        expect(error).toBeInstanceOf(ApiError);
        expect(error?.status).toBe(500);
    });

    it('wraps a rejected fetch as an ApiError with status 0', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
        const {data, error} = await apiTry('/api/x');
        expect(data).toBeNull();
        expect(error).toBeInstanceOf(ApiError);
        expect(error?.status).toBe(0);
        expect(error?.message).toBe('Failed to fetch');
        expect(error?.data).toBeNull();
    });

    it('wraps invalid JSON as an ApiError with status 0', async () => {
        mockFetch({...jsonResponse(200, null), json: async () => { throw new SyntaxError('Unexpected token'); }});
        const {data, error} = await apiTry('/api/x');
        expect(data).toBeNull();
        expect(error?.status).toBe(0);
    });

    it('still throws the browser-only guard', async () => {
        vi.unstubAllGlobals();
        await expect(apiTry('/api/x')).rejects.toThrow('réservé au navigateur');
    });
});
