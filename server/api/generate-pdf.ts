import {defineEventHandler, createError, setHeader} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {pdfApiToken} from '~/server/utils/config';
import {generatePdfFromEvent} from "~/server/services/bookPdfGenerator";

export default defineEventHandler(async (event/**/) => {
    await requireUserSession(event);

    try {
        const token = pdfApiToken();
        const pdfBuffer = await generatePdfFromEvent(token);
        const fileName = `book.pdf`;

        // Set response headers for download
        setHeader(event, 'Content-Type', 'application/pdf');
        setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

        return pdfBuffer;
    } catch (error) {
        // La raison (livre vide, chargement refusé…) n'apparaît que dans les logs du serveur
        console.error('Génération du PDF impossible :', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error generating PDF',
        });
    }

});
