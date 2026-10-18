import {describe, expect, it} from 'vitest';
import DOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';
import {sanitizeHtml} from './htmlSanitizer';

const purify = DOMPurify(new JSDOM('').window);

describe('sanitizeHtml', () => {
    it('garde l’alignement posé par l’éditeur', () => {
        expect(sanitizeHtml(purify, '<p style="text-align: center">vers</p>'))
            .toBe('<p style="text-align: center">vers</p>');
        expect(sanitizeHtml(purify, '<h2 style="text-align:right;">titre</h2>'))
            .toBe('<h2 style="text-align: right">titre</h2>');
    });

    it('retire tout autre style', () => {
        expect(sanitizeHtml(purify, '<p style="color: red">vers</p>')).toBe('<p>vers</p>');
        expect(sanitizeHtml(purify, '<p style="text-align: center; background: url(x)">vers</p>')).toBe('<p>vers</p>');
    });

    it('retire le code dangereux', () => {
        expect(sanitizeHtml(purify, '<p>vers</p><img src="x" onerror="alert(1)"><script>alert(2)</script>'))
            .toBe('<p>vers</p><img src="x">');
    });

    it('ne laisse pas la règle d’alignement active après usage', () => {
        sanitizeHtml(purify, '<p style="text-align: left">a</p>');
        expect(purify.sanitize('<p style="color: red">a</p>')).toBe('<p style="color: red">a</p>');
    });
});
