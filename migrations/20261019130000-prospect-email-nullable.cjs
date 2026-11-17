'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Après 30 jours sans accord, l'adresse est effacée mais la demande d'extrait reste comptée
        await queryInterface.changeColumn('Prospects', 'email', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DELETE FROM "Prospects" WHERE "email" IS NULL');
        await queryInterface.changeColumn('Prospects', 'email', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    }
};
