import {clearSession, createError, unsealSession, useSession} from 'h3';
import type {H3Event, SessionConfig} from 'h3';

export type SessionUser = {id: number; email: string; role: string};

export const SESSION_CONFIG: SessionConfig = {
    name: 'livre-session',
    password: process.env.SESSION_PASSWORD as string,
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    },
};

export async function setUserSession(event: H3Event, user: SessionUser): Promise<void> {
    const session = await useSession(event, SESSION_CONFIG);
    await session.update({user});
}

// Lecture seule : useSession créerait une session anonyme et poserait un cookie
export async function getUserSession(event: H3Event): Promise<{user?: SessionUser}> {
    const user = await unsealUser(event.node.req.headers.cookie ?? '');
    return user ? {user} : {};
}

export async function requireUserSession(event: H3Event): Promise<{user: SessionUser}> {
    const {user} = await getUserSession(event);
    if (!user) {
        throw createError({statusCode: 401, statusMessage: 'Unauthorized'});
    }
    return {user};
}

export async function clearUserSession(event: H3Event): Promise<void> {
    await clearSession(event, SESSION_CONFIG);
}

// Pour le middleware Astro, qui n'a qu'une Request
export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
    return unsealUser(request.headers.get('cookie') ?? '');
}

async function unsealUser(cookieHeader: string): Promise<SessionUser | null> {
    const prefix = `${SESSION_CONFIG.name}=`;
    const match = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
    if (!match) {
        return null;
    }

    try {
        // h3 n'utilise pas l'event pour desceller
        const session = await unsealSession(null as unknown as H3Event, SESSION_CONFIG, decodeURIComponent(match.slice(prefix.length)));
        return (session.data as {user?: SessionUser}).user ?? null;
    } catch {
        return null;
    }
}
