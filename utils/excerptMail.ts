// Les textes du mail qui accompagne l'extrait gratuit (version HTML et texte brut)

export interface ExcerptMailInput {
    title: string;
    author: string;
    // Nombre de textes dans le PDF joint
    textCount: number;
    offers: { name: string; price: number }[];
    footer: string;
}

export interface ExcerptMail {
    senderName: string;
    subject: string;
    lead: string;
    attachment: string;
    offersLine: string;
    footer: string;
    text: string;
}

export function excerptMail({title, author, textCount, offers, footer}: ExcerptMailInput): ExcerptMail {
    const lead = `Merci pour votre intérêt. Les premiers textes de « ${title} » vous attendent en pièce jointe.`;
    const offersLine = offers.length ? `La suite : ${offers.map(offer => `${offer.name} ${offer.price} €`).join(' · ')}` : '';

    return {
        senderName: author.trim() || title,
        subject: `Votre extrait de « ${title} »`,
        lead,
        attachment: `extrait.pdf · ${textCount} ${textCount === 1 ? 'texte' : 'textes'}`,
        offersLine,
        footer,
        text: ['Un extrait, offert.', lead, offersLine, footer].filter(Boolean).join('\n\n'),
    };
}
