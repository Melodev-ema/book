import {defineStore} from "pinia";
import {apiFetch} from "~/utils/api";
import type {AttachmentEntityInterface} from "~/entities/AttachmentEntity";
import type {BookLayoutOptions, TocPosition} from "~/utils/bookToc";

export const PAGE_FORMAT_SIZES: Record<string, string> = {
    poche: '108mm 175mm',
    digest: '140mm 216mm',
    a5: '148mm 210mm',
    royal: '156mm 234mm',
    roman: '152mm 229mm',
    bd: '168mm 260mm',
    executif: '178mm 254mm',
    'crown-quarto': '189mm 246mm',
    'petit-carre': '191mm 191mm',
    a4: '210mm 297mm',
    carre: '216mm 216mm',
    'lettre-us': '216mm 279mm',
    'petit-paysage': '229mm 178mm',
    'lettre-us-paysage': '279mm 216mm',
    'a4-paysage': '297mm 210mm',
    calendrier: '279mm 216mm',
};

// Max lines and chars per format, calculated from content area dimensions
// Height: A4 = 297mm, padding 10.6mm top+bottom → 275.8mm → 38 lines → ~7.26mm/line
// Width:  content width (w - padRight - padLeft) at 16px Cormorant → ~0.5 chars/mm
// First page ratio: 32/38 ≈ 0.84 (title + author header take space)
export const PAGE_FORMAT_LIMITS: Record<string, { maxLines: number; maxLinesFirstPage: number; maxCharsPerLine: number }> = {
    poche:              { maxLines: 22, maxLinesFirstPage: 18, maxCharsPerLine: 35 },
    digest:             { maxLines: 27, maxLinesFirstPage: 23, maxCharsPerLine: 45 },
    a5:                 { maxLines: 26, maxLinesFirstPage: 22, maxCharsPerLine: 48 },
    royal:              { maxLines: 29, maxLinesFirstPage: 25, maxCharsPerLine: 50 },
    roman:              { maxLines: 29, maxLinesFirstPage: 24, maxCharsPerLine: 49 },
    bd:                 { maxLines: 33, maxLinesFirstPage: 28, maxCharsPerLine: 54 },
    executif:           { maxLines: 32, maxLinesFirstPage: 27, maxCharsPerLine: 57 },
    'crown-quarto':     { maxLines: 31, maxLinesFirstPage: 26, maxCharsPerLine: 61 },
    'petit-carre':      { maxLines: 24, maxLinesFirstPage: 20, maxCharsPerLine: 62 },
    a4:                 { maxLines: 38, maxLinesFirstPage: 32, maxCharsPerLine: 68 },
    carre:              { maxLines: 27, maxLinesFirstPage: 23, maxCharsPerLine: 70 },
    'lettre-us':        { maxLines: 35, maxLinesFirstPage: 30, maxCharsPerLine: 70 },
    'petit-paysage':    { maxLines: 22, maxLinesFirstPage: 19, maxCharsPerLine: 74 },
    'lettre-us-paysage': { maxLines: 27, maxLinesFirstPage: 23, maxCharsPerLine: 90 },
    'a4-paysage':       { maxLines: 26, maxLinesFirstPage: 22, maxCharsPerLine: 96 },
    calendrier:         { maxLines: 27, maxLinesFirstPage: 23, maxCharsPerLine: 90 },
};

export interface BookConfigState {
    title: string;
    author: string;
    years: string;
    dedicationText: string;
    dedicationAuthor: string;
    prefaceText: string;
    pageFormat: string;
    maxLines: number;
    maxLinesFirstPage: number;
    pageStart: number;
    // Auteur et date sous chaque texte (inutile pour un livre d'un seul auteur)
    showSignature: boolean;
    // Sommaire : facultatif, au début (après la préface) ou à la fin (avant la page de fin)
    showToc: boolean;
    tocPosition: TocPosition;
    // Nombre maximum de parties listées dans le sommaire de la page d'accueil
    landingTocMaxParts: number;
}

export const useBookStore = defineStore('bookStore', {
    state: () => ({
        imagePages: [] as AttachmentEntityInterface[],
        config: {
            title: 'Recueil de Poèmes',
            author: '',
            years: '2019 - 2024',
            dedicationText: '',
            dedicationAuthor: '',
            prefaceText: '',
            pageFormat: 'a4',
            maxLines: 38,
            maxLinesFirstPage: 32,
            pageStart: 6,
            showSignature: true,
            showToc: false,
            tocPosition: 'start',
            landingTocMaxParts: 6,
        } as BookConfigState,
        configLoaded: false,
    }),
    getters: {
        getImagePageByType: (state) => (type: string) => {
            return state.imagePages.find(image => image.pageType === type);
        },
        bookCssClass: (state) => `book-${state.config.pageFormat}`,
        pageSize: (state) => PAGE_FORMAT_SIZES[state.config.pageFormat] || '210mm 297mm',
        formatMaxLines: (state) => PAGE_FORMAT_LIMITS[state.config.pageFormat] || PAGE_FORMAT_LIMITS.a4,
        effectiveMaxLines(): number {
            return Math.min(this.config.maxLines, this.formatMaxLines.maxLines);
        },
        effectiveMaxLinesFirstPage(): number {
            return Math.min(this.config.maxLinesFirstPage, this.formatMaxLines.maxLinesFirstPage);
        },
        maxCharsPerLine: (state) => (PAGE_FORMAT_LIMITS[state.config.pageFormat] || PAGE_FORMAT_LIMITS.a4).maxCharsPerLine,
        // Tout ce qu'il faut pour paginer le livre et calculer le sommaire (livre et page d'accueil)
        layoutOptions(): BookLayoutOptions {
            return {
                limits: {
                    maxLines: this.effectiveMaxLines,
                    maxLinesFirstPage: this.effectiveMaxLinesFirstPage,
                    maxCharsPerLine: this.maxCharsPerLine,
                    showSignature: this.config.showSignature,
                },
                pageStart: this.config.pageStart,
                showToc: this.config.showToc,
                tocPosition: this.config.tocPosition,
            };
        },
    },
    actions: {
        // Pose les données chargées par le serveur (rendu serveur de la landing)
        hydrate({config, imagePages}: {config: BookConfigState; imagePages: AttachmentEntityInterface[]}) {
            this.config = config;
            this.imagePages = imagePages;
            this.configLoaded = true;
        },
        async fetchImagePages() {
            try {
                const data = await apiFetch<AttachmentEntityInterface[]>('/api/image');
                if (data) {
                    this.imagePages = data;
                }
            } catch {
                // On garde les images déjà chargées
            }
        },
        async fetchConfig() {
            const data = await apiFetch<BookConfigState>('/api/book-config');
            if (data) {
                this.config = data;
            }
            this.configLoaded = true;
        },
    }
});
