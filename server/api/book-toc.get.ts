import {defineEventHandler} from 'h3';
import {findBookToc} from "~/server/services/publicData";

// Public : le sommaire de la page d'accueil. Rien du contenu des textes.
export default defineEventHandler(() => findBookToc());
