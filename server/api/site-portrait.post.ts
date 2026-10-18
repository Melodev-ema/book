import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import fs from 'fs/promises';
import {join} from 'pathe';
import SiteConfig from "~/server/models/siteConfig";
import {mergeLandingContent} from "~/utils/landingContent";

const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
};

// Envoie la photo de l'auteur : le fichier va dans public/uploads, son chemin est enregistré dans SiteConfigs.
export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const data = await readMultipartFormData(event);
    const file = data?.find(part => part.name === 'file');

    if (!file) {
        throw createError({statusCode: 400, statusMessage: 'No file uploaded'});
    }

    const extension = EXTENSIONS[file.type || ''];
    if (!extension) {
        throw createError({statusCode: 400, statusMessage: 'Invalid file type'});
    }

    // Nom unique : évite d'écraser un autre fichier et contourne le cache du navigateur.
    const url = `/uploads/author-portrait-${Date.now()}.${extension}`;
    await fs.mkdir(join(process.cwd(), 'public', 'uploads'), {recursive: true});
    await fs.writeFile(join(process.cwd(), 'public', url), file.data);

    const config = await SiteConfig.findOne();
    const stored = (config?.get('content') || {}) as Record<string, unknown>;
    const storedAuthor = (stored.author || {}) as Record<string, unknown>;
    const previousUrl = typeof storedAuthor.portraitUrl === 'string' ? storedAuthor.portraitUrl : null;

    const content = mergeLandingContent({...stored, author: {...storedAuthor, portraitUrl: url}});
    try {
        await SiteConfig.upsert({id: 1, content});
    } catch (error) {
        // Ne laisse pas de fichier orphelin si l'enregistrement échoue.
        await fs.unlink(join(process.cwd(), 'public', url)).catch(() => undefined);
        throw error;
    }

    // Supprime l'ancienne photo envoyée (jamais l'image de repli du dépôt).
    if (previousUrl?.startsWith('/uploads/author-portrait-') && previousUrl !== url) {
        await fs.unlink(join(process.cwd(), 'public', previousUrl)).catch(() => undefined);
    }

    return content;
});
