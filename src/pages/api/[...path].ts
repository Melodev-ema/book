import type {APIRoute} from 'astro';
import {apiWebHandler} from '~/server/app';

export const prerender = false;

export const ALL: APIRoute = ({request}) => apiWebHandler(request);
