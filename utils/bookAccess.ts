// Le PDF est généré en ouvrant /book?token=… dans un navigateur sans session : la page transmet
// ce jeton à l'API dans cet en-tête pour lire les textes du livre.
export const BOOK_TOKEN_HEADER = 'x-book-token';

export interface BookAccessContext {
    loggedIn: boolean;
    tokenFromQuery: string;
    expectedToken: string | undefined;
}

export function canAccessBook(ctx: BookAccessContext): boolean {
    if (ctx.loggedIn) {
        return true;
    }

    return !!ctx.expectedToken && sameToken(ctx.tokenFromQuery, ctx.expectedToken);
}

// Comparaison à temps constant (fichier partagé avec le navigateur : sans node:crypto)
function sameToken(provided: string, expected: string): boolean {
    let diff = provided.length ^ expected.length;
    for (let i = 0; i < expected.length; i++) {
        diff |= (provided.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
    }
    return diff === 0;
}
