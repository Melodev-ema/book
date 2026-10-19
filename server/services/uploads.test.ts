import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {readUpload} from './uploads';

const dir = mkdtempSync(join(tmpdir(), 'uploads-'));
writeFileSync(join(dir, 'cover-1.png'), 'png');
writeFileSync(join(dir, 'notes.txt'), 'texte');
writeFileSync(join(dir, 'Image 1 avr. 2025.png'), 'ancien');

describe('readUpload', () => {
    it('lit une image avec son type', async () => {
        expect(await readUpload('cover-1.png', dir)).toEqual({body: Buffer.from('png'), contentType: 'image/png'});
    });

    it('lit un ancien envoi au nom d\'origine', async () => {
        expect((await readUpload('Image 1 avr. 2025.png', dir))?.body.toString()).toBe('ancien');
    });

    it('refuse les chemins et les extensions inconnues', async () => {
        expect(await readUpload('../cover-1.png', dir)).toBeNull();
        expect(await readUpload('..', dir)).toBeNull();
        expect(await readUpload('sous/cover-1.png', dir)).toBeNull();
        expect(await readUpload('..\\cover-1.png', dir)).toBeNull();
        expect(await readUpload('notes.txt', dir)).toBeNull();
    });

    it('renvoie null pour un fichier absent', async () => {
        expect(await readUpload('absent.jpg', dir)).toBeNull();
    });
});
