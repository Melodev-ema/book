import {describe, expect, it} from 'vitest';
import {missingPostField} from './postForm';

describe('missingPostField', () => {
    it('exige un titre', () => {
        expect(missingPostField({postTitle: '  ', content: '<p>vers</p>'})).toBe('Le titre est obligatoire');
    });

    it('refuse un éditeur vide', () => {
        expect(missingPostField({postTitle: 'Titre', content: '<p></p>'})).toBe('Le contenu est vide');
    });

    it('accepte un texte complet', () => {
        expect(missingPostField({postTitle: 'Titre', content: '<p>vers</p>'})).toBe('');
    });
});
