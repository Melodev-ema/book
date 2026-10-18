import {fileURLToPath} from 'node:url';
import {defineConfig} from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

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
