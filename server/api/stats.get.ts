import {defineEventHandler} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import Post from "~/server/models/post";
import Prospect from "~/server/models/prospect";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    // Chaque demande d'extrait reste comptée, même une fois son adresse effacée (30 jours sans accord)
    const [postsCount, prospectsCount, subscribersCount] = await Promise.all([
        Post.count(),
        Prospect.count(),
        // Une personne peut avoir demandé l'extrait plusieurs fois : on compte les adresses
        Prospect.count({where: {newsletterConsent: true}, distinct: true, col: 'email'}),
    ]);

    return {
        posts: {name: 'Pages de votre livre', value: postsCount},
        prospects: {name: 'Extraits demandés', value: prospectsCount},
        subscribers: {name: 'Abonnés aux nouvelles du livre', value: subscribersCount},
    };
});
