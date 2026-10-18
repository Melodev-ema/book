export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, data: unknown) {
        super((data as {message?: string; statusMessage?: string} | null)?.message
            ?? (data as {statusMessage?: string} | null)?.statusMessage
            ?? `HTTP ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

type ApiOptions = {
    method?: string;
    body?: unknown;
    query?: Record<string, string | number>;
    headers?: Record<string, string>;
};

export async function apiFetch<T>(url: string, opts: ApiOptions = {}): Promise<T> {
    const headers: Record<string, string> = {...opts.headers};
    let body: BodyInit | undefined;

    if (opts.body instanceof FormData) {
        body = opts.body;
    } else if (opts.body !== undefined) {
        body = JSON.stringify(opts.body);
        headers['content-type'] = 'application/json';
    }

    let fullUrl = url;
    if (opts.query) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(opts.query)) {
            params.append(key, String(value));
        }
        fullUrl += (url.includes('?') ? '&' : '?') + params.toString();
    }

    const res = await fetch(fullUrl, {method: opts.method ?? 'GET', headers, body});
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json');

    if (!res.ok) {
        const data = isJson ? await res.json().catch(() => null) : null;
        throw new ApiError(res.status, data);
    }

    return (isJson ? await res.json() : await res.blob()) as T;
}

export async function apiTry<T>(url: string, opts: ApiOptions = {}): Promise<{data: T | null; error: ApiError | null}> {
    try {
        return {data: await apiFetch<T>(url, opts), error: null};
    } catch (e) {
        if (e instanceof ApiError) {
            return {data: null, error: e};
        }
        throw e;
    }
}
