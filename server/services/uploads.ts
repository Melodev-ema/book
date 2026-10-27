import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createError, type MultiPartData} from 'h3';

export const IMAGE_MAX_SIZE = 10 * 1024 * 1024;

// Type déclaré → extension et signature des premiers octets (le type envoyé par le navigateur ne suffit pas)
const IMAGE_TYPES: Record<string, {extension: string; magic: number[]}> = {
    'image/jpeg': {extension: 'jpg', magic: [0xff, 0xd8, 0xff]},
    'image/png': {extension: 'png', magic: [0x89, 0x50, 0x4e, 0x47]},
};

// Vérifie une image envoyée depuis l'admin (type, contenu, taille) et renvoie l'extension à lui donner
export function checkImageUpload(file: MultiPartData): string {
    const imageType = IMAGE_TYPES[file.type || ''];
    if (!imageType || !imageType.magic.every((byte, index) => file.data[index] === byte)) {
        throw createError({statusCode: 400, statusMessage: 'Invalid file type'});
    }
    if (file.data.length > IMAGE_MAX_SIZE) {
        throw createError({statusCode: 413, statusMessage: 'Image trop lourde (10 Mo maximum)'});
    }
    return imageType.extension;
}

const CONTENT_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
};

// Dossier des fichiers envoyés depuis l'admin (photo de l'auteur, images du livre)
export function uploadsDir(): string {
    return join(process.cwd(), 'public', 'uploads');
}

// Lit un fichier envoyé, par son seul nom (pas de sous-dossier) ; null s'il n'existe pas
export async function readUpload(name: string, dir = uploadsDir()): Promise<{body: Buffer; contentType: string} | null> {
    // Anciens envois : le nom d'origine (espaces, accents) ; jamais de dossier ni de fichier caché
    if (!name || name.startsWith('.') || /[/\\\0]/.test(name)) {
        return null;
    }
    const contentType = CONTENT_TYPES[name.split('.').pop()?.toLowerCase() ?? ''];
    if (!contentType) {
        return null;
    }
    try {
        return {body: await readFile(join(dir, name)), contentType};
    } catch {
        return null;
    }
}
