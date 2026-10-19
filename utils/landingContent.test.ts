import {describe, expect, it} from 'vitest';
import {landingContent, mergeLandingContent, purchasableOffers} from './landingContent';

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

describe('purchasableOffers', () => {
    const offer = landingContent.pricing.offers[0];

    it('écarte les offres sans vrai lien d\'achat', () => {
        expect(purchasableOffers([{...offer, href: '#'}, {...offer, href: ''}, {...offer, href: 'javascript:void(0)'}])).toEqual([]);
    });

    it('garde les offres avec un lien http(s)', () => {
        const ebook = {...offer, href: 'https://boutique.exemple.fr/ebook'};
        expect(purchasableOffers([ebook, {...offer, href: '#'}])).toEqual([ebook]);
    });

    it('masque les offres par défaut tant que les liens ne sont pas configurés', () => {
        expect(mergeLandingContent({}).pricing.offers).toEqual([]);
    });
});
