import DOMPurify from "dompurify";
import {JSDOM} from "jsdom";
import {sanitizeHtml} from "~/utils/htmlSanitizer";

export function sanitizeContent(content: string) {
    const window = new JSDOM('').window;
    return sanitizeHtml(DOMPurify(window), content);
}
