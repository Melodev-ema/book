import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {createJob, processJob} from "~/server/services/importQueue";
import {randomUUID} from "node:crypto";
import {IMPORT_FILE_TYPES, IMPORT_MAX_SIZE} from "~/utils/importFileTypes";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const files = await readMultipartFormData(event);

    if (!files || files.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded',
        });
    }

    const createdJobs = [];
    // Fichiers refusés (type ou taille), signalés à l'admin
    const skipped: string[] = [];

    for (const file of files) {
        const type = file.type || '';
        if (!file.filename) {
            continue;
        }
        if (!IMPORT_FILE_TYPES.includes(type) || file.data.length > IMPORT_MAX_SIZE) {
            skipped.push(file.filename);
            continue;
        }

        const jobId = randomUUID();
        const job = createJob(jobId, file.filename);
        createdJobs.push(job);

        // Process in background (no await)
        processJob(job, file);
    }

    return {jobs: createdJobs, skipped};
});
