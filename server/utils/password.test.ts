import {describe, expect, it} from 'vitest';
import {Hash} from '@adonisjs/hash';
import {Scrypt} from '@adonisjs/hash/drivers/scrypt';
import {verifyPassword} from './password';

const hash = new Hash(new Scrypt({cost: 16384, blockSize: 8, parallelization: 1}));

describe('verifyPassword', () => {
    it('produit des hash $scrypt$n=16384,r=8,p=1$', async () => {
        expect(await hash.make('secret-123')).toMatch(/^\$scrypt\$n=16384,r=8,p=1\$/);
    });

    it('accepte le bon mot de passe', async () => {
        expect(await verifyPassword(await hash.make('secret-123'), 'secret-123')).toBe(true);
    });

    it('refuse un autre mot de passe', async () => {
        expect(await verifyPassword(await hash.make('secret-123'), 'autre-chose')).toBe(false);
    });

    it('renvoie false pour un hash invalide, sans erreur', async () => {
        expect(await verifyPassword('pas-un-hash', 'secret-123')).toBe(false);
    });

    describe('hash existant de la migration user-admin', () => {
        const fixture = '$scrypt$n=16384,r=8,p=1$vTXHwMqvSo4ZrnE6ODvdVw$RRfbQPB56mZlappZwZTDG85AEf6t1BoSTWo0sWQW05nzQZrHmYuAmQECIoksTRODDcC2gLo7+7y336vDSPsCAQ';

        it('est reconnu comme un hash valide', () => {
            expect(hash.isValidHash(fixture)).toBe(true);
        });

        it('refuse un mauvais mot de passe sans erreur', async () => {
            expect(await verifyPassword(fixture, 'mauvais-mot-de-passe')).toBe(false);
        });
    });
});
