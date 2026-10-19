import {describe, expect, it} from 'vitest';
import {mergeLandingContent} from './landingContent';

const linkOf = (href: string) => mergeLandingContent({author: {link: {label: 'Site', href}}}).author.link;

describe('mergeLandingContent : lien de l\'auteur', () => {
    it('garde les liens http(s) et mailto', () => {
        expect(linkOf('https://exemple.fr')?.href).toBe('https://exemple.fr');
        expect(linkOf('mailto:auteur@exemple.fr')?.href).toBe('mailto:auteur@exemple.fr');
    });

    it('écarte les liens javascript: et data:', () => {
        expect(linkOf('javascript:alert(1)')).toBeNull();
        expect(linkOf(' JavaScript:alert(1)')).toBeNull();
        expect(linkOf('data:text/html,<script>')).toBeNull();
    });
});
