import type {APIRoute} from 'astro';
import {readUpload} from '~/server/services/uploads';

export const prerender = false;

// En production, dist/client ne contient que les fichiers présents au build : les images envoyées
// depuis l'admin (public/uploads) sont servies ici. Leurs noms sont uniques, d'où le cache long.
export const GET: APIRoute = async ({params}) => {
    const file = await readUpload(params.path ?? '');
    if (!file) {
        return new Response('Not found', {status: 404});
    }
    return new Response(new Uint8Array(file.body), {
        headers: {
            'content-type': file.contentType,
            'cache-control': 'public, max-age=31536000, immutable',
        },
    });
};
