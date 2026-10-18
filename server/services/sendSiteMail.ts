import {pdfApiToken} from '~/server/utils/config';
import nodemailer from 'nodemailer';
import {generatePdfFromEvent} from "~/server/services/bookPdfGenerator";
import {createSSRApp} from "vue";
import EmailTemplate from "~/components/email/EmailTemplate.vue";
import {renderToString} from "vue/server-renderer";
import BookConfig from "~/server/models/bookConfig";
import SiteConfig from "~/server/models/siteConfig";
import Post from "~/server/models/post";
import {mergeLandingContent} from "~/utils/landingContent";
import {EXCERPT_TEXT_COUNT} from "~/utils/bookToc";
import {excerptMail} from "~/utils/excerptMail";

const localTransporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
    secure: false,
});

export async function sendSiteMail({to}: { to: string; }) {
    // Le même jeton que le téléchargement du livre depuis l'admin (PDF_API_TOKEN)
    const token = pdfApiToken();
    const pdfBuffer = await generatePdfFromEvent(token, {excerpt: true});
    const buffer = Buffer.from(pdfBuffer.buffer);

    const [bookConfig, siteConfig, postCount] = await Promise.all([
        BookConfig.findOne(),
        SiteConfig.findOne(),
        Post.count(),
    ]);
    const site = mergeLandingContent(siteConfig?.get('content'));
    const mail = excerptMail({
        // Même titre par défaut que /api/book-config quand le livre n'est pas encore configuré.
        // get() : les champs `public …!` du modèle masquent les accesseurs de Sequelize.
        title: bookConfig?.get('title') as string || 'Recueil de Poèmes',
        author: bookConfig?.get('author') as string || '',
        textCount: Math.min(EXCERPT_TEXT_COUNT, postCount),
        offers: site.pricing.offers,
        footer: site.footer,
    });

    const html = await renderToString(createSSRApp(EmailTemplate, {mail}));

    const pageHtml = `<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="dark">
        <meta name="supported-color-schemes" content="dark">
        <title>${escapeHtml(mail.subject)}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#1c1f2b;">${html}</body>
</html>`;

    const mailOptions = {
        from: {name: mail.senderName, address: 'no-reply@tonsite.com'},
        to,
        subject: mail.subject,
        text: mail.text,
        html: pageHtml,
        attachments: [
            {
                filename: 'extrait.pdf',
                contentType: 'application/pdf',
                content: buffer,
                contentDisposition: 'attachment',
            },
        ]
    };

    localTransporter.sendMail(mailOptions).then((result) => {
        console.log('Email envoyé avec succès');
        return result;
    }).catch((error) => {
        console.error('Erreur lors de l\'envoi de l\'email', error);
        throw error;
    });
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
