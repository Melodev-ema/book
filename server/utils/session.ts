import {createHash} from 'node:crypto';
import {clearSession, createError, unsealSession, useSession} from 'h3';
import type {H3Event, SessionConfig} from 'h3';
import User, {UserRole} from '~/server/models/user';

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

type SessionData = {user?: SessionUser; stamp?: string};

// Empreinte du hash du mot de passe, gardée dans la session : changer le mot de passe ferme les sessions ouvertes
export const passwordStamp = (passwordHash: string) => createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);

export async function setUserSession(event: H3Event, user: SessionUser, passwordHash: string): Promise<void> {
    const session = await useSession(event, SESSION_CONFIG);
    await session.update({user, stamp: passwordStamp(passwordHash)});
}

// Lecture seule : useSession créerait une session anonyme et poserait un cookie.
// Mémorisée sur l'event : le middleware et le handler ne relisent la base qu'une fois.
export async function getUserSession(event: H3Event): Promise<{user?: SessionUser}> {
    event.context.sessionUser ??= unsealUser(event.node.req.headers.cookie ?? '');
    const user = await event.context.sessionUser as SessionUser | null;
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
        const {user, stamp} = session.data as SessionData;
        return user && stamp && await isStillValid(user, stamp) ? user : null;
    } catch {
        return null;
    }
}

// Le cookie seul ne suffit pas : le compte doit être encore actif, admin, et avec le même mot de passe
async function isStillValid(user: SessionUser, stamp: string): Promise<boolean> {
    const account = await User.findOne({
        where: {id: user.id, active: true, role: UserRole.ADMIN},
        attributes: ['password'],
        raw: true,
    }) as {password: string} | null;
    return !!account && passwordStamp(account.password) === stamp;
}
