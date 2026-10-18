import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Attachment from "~/server/models/attachment";
import fs from 'fs';
import {join} from "node:path";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const data = await readMultipartFormData(event);

    const firstFile = data?.[0];
    const fileType = data?.[1]?.data?.toString();
    const acceptedFileTypes = ['image/jpeg', 'image/png'];

    if (firstFile === undefined || fileType === undefined) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No file uploaded',
        });
    }

    const type = firstFile.type || '';
    if (!acceptedFileTypes.includes(type)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid file type',
        });
    }

    const sizeInBytes = (firstFile.data as Buffer).length;

    const filePath = join('/uploads', firstFile.filename!);

    // Écrire le buffer sur disque
    fs.writeFile(join(process.cwd(), 'public', filePath), firstFile.data, (err) => {
        if (err) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error writing file to disk',
            });
        }
    });

    const attachment = await Attachment.findOne({
        where: {
            pageType: fileType,
        },
        raw: true,
    });

    if (attachment) {
        await Attachment.update({
            name: firstFile.name,
            size: sizeInBytes,
            type: 'image',
            pageType: fileType,
            url: filePath,
        }, {
            where: {
                id: attachment.id,
            },
        });
    } else {
        await Attachment.create({
            name: firstFile.name,
            size: sizeInBytes,
            type: 'image',
            pageType: fileType,
            url: filePath,
        });
    }

    return Attachment.findAll();

});
