'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Dernier contact volontaire (demande d'extrait) : les abonnés sont effacés 3 ans après
        await queryInterface.addColumn('Prospects', 'lastContactAt', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.sequelize.query('UPDATE "Prospects" SET "lastContactAt" = COALESCE("consentAt", "createdAt")');
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Prospects', 'lastContactAt');
    }
};
