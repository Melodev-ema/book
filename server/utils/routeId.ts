import {createError, getRouterParam, type H3Event} from 'h3';

// Identifiant numérique de l'URL (/api/post/:id) : sinon 404, au lieu d'une erreur de la base
export function routeId(event: H3Event, notFound: string): number {
    const id = Number(getRouterParam(event, 'id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw createError({statusCode: 404, statusMessage: notFound});
    }
    return id;
}
