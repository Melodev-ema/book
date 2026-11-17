import {fileURLToPath} from 'node:url';
import {defineConfig} from 'astro/config';
import {loadEnv} from 'vite';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// `astro dev` ne charge pas .env dans process.env, or tout le code serveur le lit :
// .env.local prime sur .env, et l'environnement réel (Docker, variables en ligne) prime sur les deux.
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) {
    if (!(key in process.env)) {
        process.env[key] = value;
    }
}

export default defineConfig({
    output: 'server',
    // 20 Mo par requête au plus (1 Go par défaut) : imports de fichiers et images compris
    adapter: node({mode: 'standalone', bodySizeLimit: 20 * 1024 * 1024}),
    integrations: [vue({appEntrypoint: '/src/vue-app'})],
    server: {port: 3000, host: true},
    // Derrière un proxy : SITE_DOMAIN (au build) fait confiance à X-Forwarded-Host et X-Forwarded-For,
    // pour que les limites d'essais (login, extrait gratuit) comptent par visiteur et non par proxy
    security: {
        allowedDomains: process.env.SITE_DOMAIN ? [{hostname: process.env.SITE_DOMAIN, protocol: 'https'}] : [],
    },
    vite: {
        plugins: [tailwindcss()],
        // Le domaine utilisé ci-dessus, figé dans le build : le serveur refuse de démarrer en production sans lui
        define: {
            'process.env.BUILD_SITE_DOMAIN': JSON.stringify(process.env.SITE_DOMAIN ?? ''),
        },
        resolve: {
            alias: {
                '~': fileURLToPath(new URL('.', import.meta.url)),
            },
        },
    },
});
