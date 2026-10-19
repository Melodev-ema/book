// Types de fichiers acceptés à l'import de textes (admin et API). Pas de .doc : Pandoc ne sait pas le lire.
export const IMPORT_FILE_TYPES = [
    'application/json',
    'text/csv',
    'text/plain',
    'text/html',
    'text/markdown',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// 5 Mo par fichier
export const IMPORT_MAX_SIZE = 5 * 1024 * 1024;
