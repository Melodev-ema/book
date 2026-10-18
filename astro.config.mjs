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
    adapter: node({mode: 'standalone'}),
    integrations: [vue({appEntrypoint: '/src/vue-app'})],
    server: {port: 3000, host: true},
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                '~': fileURLToPath(new URL('.', import.meta.url)),
            },
        },
    },
});
