// Règle de nettoyage du HTML des textes, commune au serveur (enregistrement,
// import) et à l'affichage. Seul style autorisé : l'alignement de l'éditeur.
// Pas de lien (l'éditeur n'en propose pas, et le livre est imprimé) : seul leur texte est gardé.

import type DOMPurify from 'dompurify';
import type {UponSanitizeAttributeHook} from 'dompurify';

type Purifier = typeof DOMPurify;

const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'li', 'img', 'u', 's', 'br'];
const ALLOWED_ATTR = ['src', 'alt', 'title', 'style'];
const TEXT_ALIGN = /^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i;

const keepTextAlignOnly: UponSanitizeAttributeHook = (_node, data) => {
    if (data.attrName !== 'style') {
        return;
    }
    const match = TEXT_ALIGN.exec(data.attrValue);
    if (match) {
        data.attrValue = `text-align: ${match[1].toLowerCase()}`;
    } else {
        data.keepAttr = false;
    }
};

export function sanitizeHtml(purify: Purifier, html: string): string {
    purify.addHook('uponSanitizeAttribute', keepTextAlignOnly);
    try {
        return purify.sanitize(html, {ALLOWED_TAGS, ALLOWED_ATTR});
    } finally {
        purify.removeHook('uponSanitizeAttribute', keepTextAlignOnly);
    }
}
