// Contenu éditorial de la page d'accueil (page de vente du livre).
// Le titre, l'auteur et la couverture viennent de la configuration du livre (bookStore).
// Les textes ci-dessous sont les valeurs par défaut. L'en-tête, l'auteur (photo comprise), le pied de page et les informations légales
// se modifient dans l'admin (Configuration) et sont enregistrés en base (SiteConfigs) ; le reste se modifie ici.

// Le sommaire affiché n'est pas écrit ici : il est calculé à partir des textes du livre
// (voir utils/bookToc.ts). Seules les parties sont affichées, dans la limite réglée dans la configuration
// du livre (landingTocMaxParts) ; sans partie, la section est masquée.
export interface LandingTocPart {
    title: string;
    // Chiffre romain de la partie
    numeral: string;
}

// Réponse de /api/book-toc : les parties affichées, et le nombre de celles au-delà de la limite
export interface LandingToc {
    parts: LandingTocPart[];
    hiddenCount: number;
}

export interface LandingOffer {
    id: string;
    name: string;
    format: string;
    price: number;
    description: string;
    features: string[];
    href: string;
    cta: string;
    featured?: boolean;
    badge?: string;
}

export interface LandingTestimonial {
    quote: string;
    name: string;
    role?: string;
    rating?: number;
}

// Éditeur et hébergeur du site, pour les mentions légales et la politique de confidentialité
export interface LandingLegal {
    // Dénomination sociale (ex. MELODEV)
    publisher: string;
    legalForm: string;
    capital: string;
    address: string;
    siren: string;
    siret: string;
    rcs: string;
    vatNumber: string;
    email: string;
    phone: string;
    publicationDirector: string;
    hostName: string;
    hostAddress: string;
    hostSiren: string;
    hostRcs: string;
    hostPhone: string;
}

const LEGAL_FIELDS: (keyof LandingLegal)[] = [
    'publisher', 'legalForm', 'capital', 'address', 'siren', 'siret', 'rcs', 'vatNumber', 'email', 'phone',
    'publicationDirector', 'hostName', 'hostAddress', 'hostSiren', 'hostRcs', 'hostPhone',
];

// Champs sans lesquels les mentions légales sont incomplètes. Les autres (capital, RCS, TVA, téléphones…)
// dépendent de la forme de l'entreprise : ils ne s'affichent que s'ils sont renseignés.
const REQUIRED_LEGAL_FIELDS: (keyof LandingLegal)[] = [
    'publisher', 'legalForm', 'address', 'siret', 'email', 'publicationDirector', 'hostName', 'hostAddress',
];

export function missingLegalFields(legal: LandingLegal): (keyof LandingLegal)[] {
    return REQUIRED_LEGAL_FIELDS.filter(field => !legal[field].trim());
}

export interface LandingContent {
    genre: string;
    pagesLabel: string;
    pitch: string;
    // Laisser à null tant qu'aucun avis réel n'est disponible : la section est alors masquée.
    testimonial: LandingTestimonial | null;
    toc: {
        heading: string;
        headingEmphasis: string;
        intro: string;
    };
    freeSample: {
        heading: string;
        headingEmphasis: string;
        intro: string;
        note: string;
    };
    author: {
        label: string;
        portraitUrl: string | null;
        bio: string[];
        link: { label: string; href: string } | null;
    };
    pricing: {
        heading: string;
        headingEmphasis: string;
        intro: string;
        offers: LandingOffer[];
    };
    footer: string;
    legal: LandingLegal;
}

export const landingContent: LandingContent = {
    genre: 'Recueil',
    pagesLabel: 'Poèmes et récits',
    pitch: 'Des poèmes et des récits courts, composés comme un vrai livre : à lire lentement, à voix basse, et à ouvrir n\'importe où.',
    testimonial: null,
    toc: {
        heading: 'Le sommaire,',
        headingEmphasis: 'partie par partie.',
        intro: 'Les grandes parties du recueil, dans l\'ordre du livre.',
    },
    freeSample: {
        heading: 'Un extrait,',
        headingEmphasis: 'offert.',
        intro: 'Laissez votre adresse : vous recevrez par e-mail un extrait du livre en PDF, avec les premiers textes du recueil.',
        note: 'Votre adresse sert à envoyer l\'extrait, et les nouvelles du livre seulement si vous cochez la case.',
    },
    author: {
        label: 'L\'auteur',
        // Image de repli, utilisée tant qu'aucune photo n'a été envoyée depuis Configuration.
        portraitUrl: '/images/avatars/author.png',
        // Vide par défaut : se renseigne dans Configuration.
        bio: [],
        link: null,
    },
    pricing: {
        heading: 'À l\'écran',
        headingEmphasis: 'ou sur papier.',
        intro: 'Le même livre, composé avec le même soin, en deux éditions.',
        offers: [
            {
                id: 'ebook',
                name: 'E-book',
                format: 'PDF',
                price: 5,
                description: 'Téléchargez la version numérique du livre.',
                features: [
                    'Téléchargement instantané',
                    'Sur tous vos appareils',
                    'Lecture sur écran',
                ],
                href: '#',
                cta: 'Acheter l\'e-book',
            },
            {
                id: 'print',
                name: 'Livre imprimé',
                format: 'Papier',
                price: 29,
                description: 'Recevez chez vous la version imprimée de l\'édition complète.',
                features: [
                    'Livraison à domicile',
                    'Confort de lecture papier',
                    'À feuilleter, annoter, conserver',
                    'À offrir, relire, ou ranger dans sa bibliothèque',
                ],
                href: '#',
                cta: 'Commander le livre',
                featured: true,
                badge: 'Édition complète',
            },
        ],
    },
    footer: '© 2025 Élodie Malet – Melodev. Tous droits réservés.',
    // Vide par défaut : se renseigne dans Configuration (les pages affichent « à compléter »)
    legal: Object.fromEntries(LEGAL_FIELDS.map(field => [field, ''])) as unknown as LandingLegal,
};

type Loose = Record<string, unknown> | null | undefined;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const str = (value: unknown, fallback: string): string => typeof value === 'string' ? value : fallback;

const strList = (value: unknown, fallback: string[]): string[] => Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : fallback;

const section = (value: unknown): Record<string, unknown> => isObject(value) ? value : {};

function mergeLink(value: unknown, fallback: LandingContent['author']['link']): LandingContent['author']['link'] {
    if (value === null) {
        return null;
    }
    if (!isObject(value)) {
        return fallback;
    }
    const href = str(value.href, '').trim();
    // Seuls les liens web et mail : un « javascript: » saisi dans l'admin s'exécuterait sur la landing
    if (!/^(https?:\/\/|mailto:)/i.test(href)) {
        return null;
    }
    return {label: str(value.label, '').trim() || href, href};
}

// Offres qu'on peut vraiment acheter : sans lien d'achat (« # » par défaut), une offre n'est pas affichée.
// Tant qu'aucune ne l'est, la section « Obtenir le livre » et les prix disparaissent de la landing et du mail.
export function purchasableOffers(offers: LandingOffer[]): LandingOffer[] {
    return offers.filter(offer => /^https?:\/\//i.test(offer.href.trim()));
}

// Fusionne un contenu enregistré (éventuellement partiel ou ancien) avec les valeurs par défaut.
// Seuls l'en-tête, l'auteur (photo comprise), le pied de page et les informations légales sont configurables ;
// le reste (sommaire, extrait gratuit, offres, avis) garde toujours la valeur par défaut.
export function mergeLandingContent(stored: Loose | unknown, defaults: LandingContent = landingContent): LandingContent {
    const data = section(stored);
    const author = section(data.author);
    const legal = section(data.legal);

    return {
        ...defaults,
        pricing: {...defaults.pricing, offers: purchasableOffers(defaults.pricing.offers)},
        genre: str(data.genre, defaults.genre),
        pagesLabel: str(data.pagesLabel, defaults.pagesLabel),
        pitch: str(data.pitch, defaults.pitch),
        author: {
            label: str(author.label, defaults.author.label),
            portraitUrl: str(author.portraitUrl, '').trim() || defaults.author.portraitUrl,
            bio: strList(author.bio, defaults.author.bio),
            link: 'link' in author ? mergeLink(author.link, defaults.author.link) : defaults.author.link,
        },
        footer: str(data.footer, defaults.footer),
        legal: Object.fromEntries(LEGAL_FIELDS.map(field => [field, str(legal[field], defaults.legal[field]).trim()])) as unknown as LandingLegal,
    };
}
