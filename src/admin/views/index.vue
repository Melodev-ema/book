<template>
    <AdminPage>
        <template #title>
            Bonjour. <em class="italic">Le livre avance.</em>
        </template>
        <template #subtitle>{{ today }}</template>
        <template #buttons>
            <BaseButton @click="$router.push('/content/add')">
                <PlusIcon
                    class="mr-2 -ml-1 size-4"
                    aria-hidden="true"/>
                Ajouter un contenu
            </BaseButton>
        </template>

        <div class="flex flex-col gap-12">
            <AdminStats/>

            <section
                aria-labelledby="shortcuts-title"
                class="flex flex-col gap-4"
            >
                <h2
                    id="shortcuts-title"
                    class="text-[11px] font-semibold tracking-[0.08em] text-atelier-muted uppercase"
                >
                    Continuer
                </h2>
                <ul
                    role="list"
                    class="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                    <li
                        v-for="action in actions"
                        :key="action.title"
                    >
                        <RouterLink
                            :to="action.href"
                            class="flex h-full items-center gap-4 rounded-[10px] border border-atelier-line bg-atelier-panel p-5 transition-colors duration-150 hover:border-atelier-line-strong hover:bg-atelier-hover focus-visible:outline-2 focus-visible:outline-lilas"
                        >
                            <span
                                class="flex size-12 shrink-0 items-center justify-center rounded-lg"
                                :class="action.iconClass"
                                aria-hidden="true"
                            >
                                <component
                                    :is="action.icon"
                                    class="size-5"/>
                            </span>
                            <span class="flex flex-col gap-1">
                                <span class="text-[15px] font-semibold text-atelier-ink">{{ action.title }}</span>
                                <span class="text-[13px] text-atelier-muted">{{ action.description }}</span>
                            </span>
                        </RouterLink>
                    </li>
                </ul>
            </section>
        </div>
    </AdminPage>
</template>

<script setup lang="ts">
import {AdjustmentsHorizontalIcon, ArrowUpTrayIcon, BookOpenIcon, PlusIcon} from '@heroicons/vue/24/outline';
import AdminStats from "~/components/admin/AdminStats.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";

const today = new Intl.DateTimeFormat('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'}).format(new Date());

const actions = [
    {
        title: 'Feuilleter le livre',
        description: 'Couverture, textes, page de fin',
        href: '/book',
        icon: BookOpenIcon,
        iconClass: 'bg-page text-page-ink',
    },
    {
        title: 'Importer des textes',
        description: 'Fichiers ou API',
        href: '/import',
        icon: ArrowUpTrayIcon,
        iconClass: 'bg-menthe-soft text-menthe',
    },
    {
        title: 'Configurer le livre',
        description: 'Titre, dédicace, format',
        href: '/book/settings',
        icon: AdjustmentsHorizontalIcon,
        iconClass: 'bg-lilas-soft text-lilas-light',
    },
];
</script>
