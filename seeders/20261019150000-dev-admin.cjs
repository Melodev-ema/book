'use strict';

// Même hash que l'ancien compte des migrations : même mot de passe qu'avant en dev.
// La connexion avec ce mot de passe est de toute façon refusée en production (server/api/login.post.ts).
const DEV_ADMIN_HASH = '$scrypt$n=16384,r=8,p=1$vTXHwMqvSo4ZrnE6ODvdVw$RRfbQPB56mZlappZwZTDG85AEf6t1BoSTWo0sWQW05nzQZrHmYuAmQECIoksTRODDcC2gLo7+7y336vDSPsCAQ';

// Compte admin@admin.com pour le développement. Rejouable : ne touche pas un compte existant.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Seeder de développement : à ne pas lancer en production (npm run admin:password)');
        }
        await queryInterface.sequelize.query(
            `INSERT INTO "Users" ("name", "email", "password", "emailVerified", "role", "active", "createdAt", "updatedAt")
             VALUES ('Admin', 'admin@admin.com', :hash, true, 'admin', true, now(), now())
             ON CONFLICT ("email") DO NOTHING`,
            {replacements: {hash: DEV_ADMIN_HASH}},
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            `DELETE FROM "Users" WHERE "email" = 'admin@admin.com' AND "password" = :hash`,
            {replacements: {hash: DEV_ADMIN_HASH}},
        );
    },
};
