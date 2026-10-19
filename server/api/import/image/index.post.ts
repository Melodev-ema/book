import {defineEventHandler, createError, readMultipartFormData} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Attachment from "~/server/models/attachment";
import fs from 'fs/promises';
import {join} from "node:path";
import {IMAGE_PAGE_TYPES} from "~/utils/imagePageTypes";
import {checkImageUpload} from "~/server/services/uploads";

// Image d'une page du livre (couverture, page de fin…) : le fichier va dans public/uploads sous un nom choisi ici
export default defineEventHandler(async (event) => {
    await requireUserSession(event);
    const data = await readMultipartFormData(event);

    const file = data?.find(part => part.filename !== undefined);
    const pageType = data?.find(part => part.filename === undefined)?.data.toString();

    if (!file || !pageType) {
        throw createError({statusCode: 400, statusMessage: 'No file uploaded'});
    }
    if (!IMAGE_PAGE_TYPES.includes(pageType)) {
        throw createError({statusCode: 400, statusMessage: 'Invalid page type'});
    }

    const extension = checkImageUpload(file);

    // Nom unique : jamais celui envoyé par le navigateur (pas de « ../ »), et le cache du navigateur est contourné
    const url = `/uploads/${pageType}-${Date.now()}.${extension}`;
    await fs.mkdir(join(process.cwd(), 'public', 'uploads'), {recursive: true});
    await fs.writeFile(join(process.cwd(), 'public', url), file.data);

    const attachment = await Attachment.findOne({where: {pageType}, raw: true});
    const fields = {
        name: file.filename,
        size: file.data.length,
        type: 'image',
        pageType,
        url,
    };

    if (attachment) {
        await Attachment.update(fields, {where: {id: attachment.id}});
        // Supprime l'image remplacée
        if (attachment.url?.startsWith('/uploads/') && !attachment.url.includes('..')) {
            await fs.unlink(join(process.cwd(), 'public', attachment.url)).catch(() => undefined);
        }
    } else {
        await Attachment.create(fields);
    }

    return Attachment.findAll();
});
