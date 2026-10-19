import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {MultiPartData} from 'h3';
import Post from '~/server/models/post';
import {importFromJson} from './importFromJson';

// Vrai modèle (pour son validateur), sur une connexion jamais ouverte ; seul create est remplacé
vi.mock('~/server/utils/db', async () => {
    const {Sequelize} = await import('sequelize');
    return {default: {sequelize: new Sequelize('postgres://test@localhost/test', {logging: false})}};
});

const jsonFile = (value: unknown) => ({filename: 'textes.json', data: Buffer.from(JSON.stringify(value))}) as MultiPartData;

describe('importFromJson', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(Post, 'create').mockResolvedValue({} as never);
    });

    it('crée un texte par élément du tableau JSON', async () => {
        const [result] = await importFromJson({data: [jsonFile([
            {postTitle: 'Un', author: 'A', content: '<p>Premier</p>', publishDate: '2024-03-01'},
            {postTitle: 'Deux', author: 'A', content: 'Second'},
        ])]});

        expect(result.posts).toEqual({success: 2, error: 0, total: 2});
        expect(Post.create).toHaveBeenCalledWith(expect.objectContaining({postTitle: 'Un', content: '<p>Premier</p>'}));
    });

    it('accepte un objet seul', async () => {
        const [result] = await importFromJson({data: [jsonFile({postTitle: 'Seul', author: 'A', content: 'Texte'})]});
        expect(result.posts.success).toBe(1);
    });

    it('compte en erreur les textes invalides et un JSON illisible, sans bloquer les autres', async () => {
        const broken = {filename: 'casse.json', data: Buffer.from('{pas du json')} as MultiPartData;
        const [result] = await importFromJson({data: [jsonFile([{postTitle: '', author: 'A', content: 'x'}, {postTitle: 'Ok', author: 'A', content: 'x'}]), broken]});

        expect(result.posts).toEqual({success: 1, error: 2, total: 3});
        expect(result.errors).toEqual([expect.stringContaining('casse.json')]);
    });

    it('un échec d\'enregistrement ne fait pas échouer les autres textes', async () => {
        vi.mocked(Post.create).mockRejectedValueOnce(new Error('base indisponible'));
        const [result] = await importFromJson({data: [jsonFile([
            {postTitle: 'Un', author: 'A', content: 'x'},
            {postTitle: 'Deux', author: 'A', content: 'y'},
        ])]});

        expect(result.posts).toEqual({success: 1, error: 1, total: 2});
    });
});
