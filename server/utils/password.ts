import {Hash} from '@adonisjs/hash';
import {Scrypt} from '@adonisjs/hash/drivers/scrypt';

const hash = new Hash(new Scrypt({cost: 16384, blockSize: 8, parallelization: 1}));

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
    try {
        return await hash.verify(hashed, plain);
    } catch {
        return false;
    }
}
