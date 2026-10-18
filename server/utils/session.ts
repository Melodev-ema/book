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

export async function getUserSession(event: H3Event): Promise<{user?: SessionUser}> {
    // Un cookie illisible ou expiré fait lever useSession : on le traite comme « pas connecté »
    try {
        const session = await useSession<{user?: SessionUser}>(event, SESSION_CONFIG);
        return session.data.user ? {user: session.data.user} : {};
    } catch {
        return {};
    }
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

// Pour le middleware Astro, qui n'a qu'une Request (h3 n'utilise pas l'event ici)
export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
    const match = (request.headers.get('cookie') ?? '')
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_CONFIG.name}=`));
    if (!match) {
        return null;
    }

    try {
        const value = decodeURIComponent(match.slice(SESSION_CONFIG.name!.length + 1));
        const session = await unsealSession(null as unknown as H3Event, SESSION_CONFIG, value);
        return (session.data as {user?: SessionUser}).user ?? null;
    } catch {
        return null;
    }
}
