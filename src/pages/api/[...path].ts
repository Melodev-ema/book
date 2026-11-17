import type {APIRoute} from 'astro';
import {apiWebHandler} from '~/server/app';

export const prerender = false;

// clientAddress : l'IP du visiteur, pour limiter les tentatives (login, extrait gratuit)
export const ALL: APIRoute = ({request, clientAddress}) => apiWebHandler(request, {clientAddress});
