import {defineEventHandler, createError, readValidatedBody} from 'h3';
import Prospect from "~/server/models/prospect";
import {z} from "zod";
import {sendSiteMail} from "~/server/services/sendSiteMail";

const bodySchema = z.object({
    email: z.string().email(),
});

export default defineEventHandler(async (event) => {
    const {email} = await readValidatedBody(event, bodySchema.parse);

    await Prospect.create({
        email,
    }).catch((error) => {
        throw createError({
            statusCode: error.code,
            statusMessage: error.name,
        });
    });

    return sendSiteMail({to: email})
        .then(() => {
            return {
                message: 'Email envoyé avec succès',
            };
        })
        .catch(() => {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erreur lors de l\'envoi de l\'email',
            });
        });

});
