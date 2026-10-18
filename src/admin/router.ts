import {createRouter, createWebHistory, type Router} from 'vue-router';
import {useSession} from '~/utils/useSession';

declare module 'vue-router' {
    interface RouteMeta {
        layout?: 'admin' | 'login';
        public?: boolean;
    }
}

let sessionLoaded = false;

export function createAdminRouter(): Router {
    const router = createRouter({
        history: createWebHistory('/admin'),
        routes: [
            {
                path: '/',
                children: [
                    {path: '', component: () => import('./views/index.vue')},
                    {path: 'login', component: () => import('./views/login.vue'), meta: {layout: 'login', public: true}},
                    {path: 'book', component: () => import('./views/book/index.vue')},
                    {path: 'book/parts', component: () => import('./views/book/parts.vue')},
                    {path: 'book/settings', component: () => import('./views/book/settings.vue')},
                    {path: 'content', component: () => import('./views/content/index.vue')},
                    {path: 'content/add', component: () => import('./views/content/add.vue')},
                    {path: 'content/:id', component: () => import('./views/content/[id]/index.vue')},
                    {path: 'content/:id/edit', component: () => import('./views/content/[id]/edit.vue')},
                    {path: 'import', component: () => import('./views/import/index.vue')},
                    {path: 'import/api', component: () => import('./views/import/api.vue')},
                    {path: 'settings', component: () => import('./views/settings.vue')},
                    {path: ':pathMatch(.*)*', redirect: '/'},
                ],
            },
        ],
    });

    router.beforeEach(async (to) => {
        const session = useSession();
        if (!sessionLoaded) {
            sessionLoaded = true;
            try {
                await session.fetch();
            } catch {
                // Session illisible : on reste déconnecté
            }
        }

        if (!to.meta.public && !session.loggedIn.value) {
            return '/login';
        }
        if (to.path === '/login' && session.loggedIn.value) {
            return '/';
        }
    });

    return router;
}
