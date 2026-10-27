import {describe, expect, it} from 'vitest';
import {excerptMail} from './excerptMail';

const offers = [
    {name: 'E-book', price: 5},
    {name: 'Livre imprimé', price: 29},
];

const mail = (overrides = {}) => excerptMail({
    title: 'Mon petit livre',
    author: 'Elodie',
    textCount: 5,
    offers,
    footer: '© 2025 Élodie Malet',
    ...overrides,
});

describe('excerptMail', () => {
    it('names the book in the subject and the lead', () => {
        expect(mail().subject).toBe('Votre extrait de « Mon petit livre »');
        expect(mail().lead).toContain('« Mon petit livre »');
    });

    it('signs as the author, or as the book when there is no author', () => {
        expect(mail().senderName).toBe('Elodie');
        expect(mail({author: '  '}).senderName).toBe('Mon petit livre');
    });

    it('counts the texts of the attachment', () => {
        expect(mail().attachment).toBe('extrait.pdf · 5 textes');
        expect(mail({textCount: 1}).attachment).toBe('extrait.pdf · 1 texte');
    });

    it('lists every offer with its price', () => {
        expect(mail().offersLine).toBe('La suite : E-book 5 € · Livre imprimé 29 €');
    });

    it('n\'annonce aucune suite sans offre à acheter', () => {
        expect(mail({offers: []}).offersLine).toBe('');
        expect(mail({offers: []}).text).not.toContain('La suite');
    });

    it('repeats the message in the plain text version', () => {
        const {text} = mail();
        expect(text).toContain('Les premiers textes de « Mon petit livre »');
        expect(text).toContain('La suite : E-book 5 € · Livre imprimé 29 €');
        expect(text).toContain('© 2025 Élodie Malet');
    });
});
