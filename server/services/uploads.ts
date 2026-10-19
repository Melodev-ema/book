import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

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
