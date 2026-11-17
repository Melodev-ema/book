// Purge des prospects, lancée chaque nuit par un job planifié (Scaleway Serverless Jobs, voir README).
// Compilé au build dans dist/scripts/purge-prospects.mjs : node dist/scripts/purge-prospects.mjs
import db from '~/server/utils/db';
import {PROSPECT_RETENTION_DAYS, SUBSCRIBER_RETENTION_YEARS, purgeExpiredProspects} from '~/server/services/prospectRetention';

try {
    const {withoutConsent, subscribers} = await purgeExpiredProspects();
    console.log(`Adresses sans accord effacées (plus de ${PROSPECT_RETENTION_DAYS} jours) : ${withoutConsent}`);
    console.log(`Abonnés effacés (sans contact depuis ${SUBSCRIBER_RETENTION_YEARS} ans) : ${subscribers}`);
} catch (error) {
    console.error('Purge des prospects impossible :', error);
    // Code de sortie non nul : le job apparaît en échec dans la console Scaleway
    process.exitCode = 1;
} finally {
    await db.sequelize.close();
}
