// Crée un compte administrateur ou change son mot de passe.
// Usage : npm run admin:password -- <email>   (le mot de passe est demandé, sans écho)
// Avec --disable-default : désactive aussi le compte admin@admin.com créé par les migrations.
import {createInterface} from 'node:readline';
import {createRequire} from 'node:module';
import pg from 'pg';
import {Hash} from '@adonisjs/hash';
import {Scrypt} from '@adonisjs/hash/drivers/scrypt';

const config = createRequire(import.meta.url)('../config/config.cjs')[process.env.NODE_ENV || 'development'];
// Mêmes réglages que server/utils/password.ts
const hash = new Hash(new Scrypt({cost: 16384, blockSize: 8, parallelization: 1}));
const MIN_LENGTH = 12;

function askHidden(question) {
    return new Promise((resolve) => {
        const rl = createInterface({input: process.stdin, output: process.stdout, terminal: true});
        rl._writeToOutput = (text) => {
            if (text.includes(question)) {
                rl.output.write(text);
            }
        };
        rl.question(question, (answer) => {
            rl.close();
            process.stdout.write('\n');
            resolve(answer);
        });
    });
}

const args = process.argv.slice(2);
const email = args.find((arg) => !arg.startsWith('--'));
const disableDefault = args.includes('--disable-default');

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage : npm run admin:password -- <email> [--disable-default]');
    process.exit(1);
}

const password = process.env.ADMIN_PASSWORD ?? await askHidden('Nouveau mot de passe : ');
if (password.length < MIN_LENGTH) {
    console.error(`Le mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
    process.exit(1);
}
if (!process.env.ADMIN_PASSWORD && password !== await askHidden('Confirmer : ')) {
    console.error('Les deux mots de passe diffèrent.');
    process.exit(1);
}

const client = new pg.Client({
    host: config.host,
    port: Number(config.port),
    user: config.username,
    password: config.password,
    database: config.database,
});
await client.connect();

try {
    const hashed = await hash.make(password);
    const {rowCount} = await client.query(
        `UPDATE "Users" SET "password" = $1, "role" = 'admin', "active" = true, "updatedAt" = now() WHERE "email" = $2`,
        [hashed, email],
    );
    if (rowCount === 0) {
        await client.query(
            `INSERT INTO "Users" ("name", "email", "password", "emailVerified", "role", "active", "createdAt", "updatedAt")
             VALUES ('Admin', $1, $2, true, 'admin', true, now(), now())`,
            [email, hashed],
        );
        console.log(`Compte administrateur créé : ${email}`);
    } else {
        console.log(`Mot de passe changé : ${email}`);
    }

    if (disableDefault && email !== 'admin@admin.com') {
        await client.query(`UPDATE "Users" SET "active" = false, "updatedAt" = now() WHERE "email" = 'admin@admin.com'`);
        console.log('Compte admin@admin.com désactivé.');
    }
} finally {
    await client.end();
}
