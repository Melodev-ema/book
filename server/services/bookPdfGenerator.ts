import puppeteer from 'puppeteer';
import {PDFDocument} from 'pdf-lib';
import {bookRenderProblem} from './bookRenderCheck';

// Le navigateur headless tourne à côté du serveur : il l'appelle en local, jamais par l'adresse
// publique (derrière un proxy comme Traefik, livre.localhost:80 n'existe pas dans le conteneur)
function internalBaseUrl() {
    return `http://127.0.0.1:${process.env.PORT || 3000}`;
}

// Un seul Chromium à la fois : plusieurs demandes simultanées (extrait gratuit, admin) attendent leur tour
let queue: Promise<unknown> = Promise.resolve();

// excerpt : n'imprime que les premiers textes du livre (l'extrait gratuit)
export function generatePdfFromEvent(token: string | undefined, {excerpt = false} = {}): Promise<Buffer> {
    const run = queue.then(() => renderPdf(token, excerpt));
    queue = run.catch(() => undefined);
    return run;
}

async function renderPdf(token: string | undefined, excerpt: boolean) {
    if (!token) {
        throw new Error('PDF_API_TOKEN n\'est pas configuré');
    }

    const url = `${internalBaseUrl()}/book?token=${encodeURIComponent(token)}${excerpt ? '&extrait=1' : ''}`;

    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let pdfBuffer: Uint8Array;
    let expectedPages: number;
    try {
        const page = await browser.newPage();
        await page.emulateMediaType('print');
        await page.goto(url, {waitUntil: 'networkidle0'});

        // Un livre en échec ou sans texte ne s'imprime pas (sinon : un PDF réduit à la couverture)
        const render = await page.evaluate(() => ({
            pages: document.querySelectorAll('.page').length,
            texts: Number(document.querySelector('[data-book-texts]')?.getAttribute('data-book-texts') ?? 0),
            error: document.querySelector('[data-book-error]')?.getAttribute('data-book-error') ?? null,
        }));
        const problem = bookRenderProblem(render);
        if (problem) {
            throw new Error(`${problem} (${page.url().split('?')[0]})`);
        }
        expectedPages = render.pages;

        pdfBuffer = await page.pdf({
            printBackground: true,
            preferCSSPageSize: true
        });
    } finally {
        await browser.close();
    }

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();

    while (totalPages > expectedPages && pdfDoc.getPageCount() > expectedPages) {
        pdfDoc.removePage(pdfDoc.getPageCount() - 1);
    }

    const finalPdf = await pdfDoc.save();
    return Buffer.from(finalPdf);
}
