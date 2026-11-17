'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Accord explicite pour recevoir les nouvelles du livre (case non cochée par défaut).
        // Les prospects existants n'ont rien accepté : false.
        await queryInterface.addColumn('Prospects', 'newsletterConsent', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        // Date de l'accord (null sans accord), à garder comme preuve
        await queryInterface.addColumn('Prospects', 'consentAt', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Prospects', 'consentAt');
        await queryInterface.removeColumn('Prospects', 'newsletterConsent');
    }
};
