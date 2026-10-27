'use strict';

// Hash du mot de passe public de admin@admin.com (migration 20250704120748-user-admin)
const DEFAULT_ADMIN_HASH = '$scrypt$n=16384,r=8,p=1$vTXHwMqvSo4ZrnE6ODvdVw$RRfbQPB56mZlappZwZTDG85AEf6t1BoSTWo0sWQW05nzQZrHmYuAmQECIoksTRODDcC2gLo7+7y336vDSPsCAQ';

// Supprime le compte admin@admin.com tant qu'il a encore son mot de passe public.
// En production, le compte admin se crée avec npm run admin:password ; en dev, avec le seeder (npm run seed).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            `DELETE FROM "Users" WHERE "email" = 'admin@admin.com' AND "password" = :hash`,
            {replacements: {hash: DEFAULT_ADMIN_HASH}},
        );
    },

    // Rien à rétablir : recréer un compte au mot de passe public n'est jamais souhaitable
    async down() {
    },
};
