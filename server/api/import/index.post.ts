import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import type { ImportResult} from "~/server/utils/importer/importFromJson";
import {importFromJson, importFromText} from "~/server/utils/importer/importFromJson";

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

    const firstFile = files?.[0];

    if (firstFile === undefined) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No file uploaded',
        });
    }

    const jsonFiles = [];
    const textFiles = [];
    if (files === undefined) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No file uploaded',
        });
    }

    for (const file of files) {

        const type = file.type || '';
        if (!acceptedFileTypes.includes(type) || !file.filename) {
            continue;
        }

        const fileExtension = file?.filename.split('.').pop() || '';
        if (fileExtension === 'json') {
            jsonFiles.push(file);
        } else {
            textFiles.push(file);
        }
    }

    const results: ImportResult[] = [];

    if (jsonFiles.length > 0) {
        const jsonResult = await importFromJson({data: jsonFiles});
        jsonResult.forEach(item => {
            results.push(item);
        });
    }

    if (textFiles.length > 0) {
        const textResult = await importFromText({data: textFiles});
        textResult.forEach(item => {
            results.push(item);
        });
    }

    if (results.length === 0) {
        return {
            result: {
                posts: {
                    success: 0,
                    error: 0,
                    total: 0,
                }
            }
        };
    }

    const mergedResult = results.slice(1).reduce<ImportResult>(
        (acc, curr) => ({
            posts: {
                success: acc.posts.success + curr.posts.success,
                error: acc.posts.error + curr.posts.error,
                total: acc.posts.total + curr.posts.total,
            }
        }),
        results[0]
    );

    return {
        result: mergedResult,
    };
});
