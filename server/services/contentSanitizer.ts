import DOMPurify from "dompurify";
import {JSDOM} from "jsdom";
import {sanitizeHtml} from "~/utils/htmlSanitizer";

// Une seule fenêtre JSDOM pour tout le serveur : le nettoyage est synchrone, il peut la partager
const purify = DOMPurify(new JSDOM('').window);

export function sanitizeContent(content: string) {
    return sanitizeHtml(purify, content);
}
