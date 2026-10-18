import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {createJob, processJob} from "~/server/services/importQueue";
import {randomUUID} from "node:crypto";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const files = await readMultipartFormData(event);
    const acceptedFileTypes = [
        'application/json',
        'text/csv',
        'text/plain',
        'text/html',
        'text/markdown',
        'application/vnd.oasis.opendocument.text',
        'application/msword',
    ];

    if (!files || files.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded',
        });
    }

    const createdJobs = [];

    for (const file of files) {
        const type = file.type || '';
        if (!acceptedFileTypes.includes(type) || !file.filename) {
            continue;
        }

        const jobId = randomUUID();
        const job = createJob(jobId, file.filename);
        createdJobs.push(job);

        // Process in background (no await)
        processJob(job, file);
    }

    return {jobs: createdJobs};
});
