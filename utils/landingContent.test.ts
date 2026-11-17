import {describe, expect, it} from 'vitest';
import {landingContent, mergeLandingContent, missingLegalFields, purchasableOffers} from './landingContent';

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

describe('mergeLandingContent : informations légales', () => {
    it('vides par défaut', () => {
        expect(mergeLandingContent({}).legal.publisher).toBe('');
        expect(missingLegalFields(mergeLandingContent({}).legal)).toContain('publisher');
    });

    it('garde les champs connus, nettoyés, et ignore les autres', () => {
        const {legal} = mergeLandingContent({legal: {publisher: '  Melodev ', siret: 123, inconnu: 'x'}});
        expect(legal.publisher).toBe('Melodev');
        expect(legal.siret).toBe('');
        expect(legal).not.toHaveProperty('inconnu');
    });

    it('ne signale plus rien quand les champs obligatoires sont remplis', () => {
        const legal = {
            ...mergeLandingContent({}).legal,
            publisher: 'Melodev', legalForm: 'EI', siret: '123', address: '1 rue', email: 'a@b.fr',
            publicationDirector: 'É. M.', hostName: 'OVH', hostAddress: '2 rue',
        };
        expect(missingLegalFields(legal)).toEqual([]);
    });
});
