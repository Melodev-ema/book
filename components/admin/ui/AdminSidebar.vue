<template>
    <div class="min-h-screen bg-atelier-ground font-instrument text-atelier-ink antialiased">
        <!-- Barre latérale mobile -->
        <TransitionRoot
            as="template"
            :show="sidebarOpen">
            <DialogComponent
                class="relative z-50 lg:hidden"
                @close="sidebarOpen = false">
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-200"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/60"/>
                </TransitionChild>
                <div class="fixed inset-0 flex">
                    <TransitionChild
                        as="template"
                        enter="transition ease-atelier duration-240 transform"
                        enter-from="-translate-x-full"
                        enter-to="translate-x-0"
                        leave="transition ease-in duration-200 transform"
                        leave-from="translate-x-0"
                        leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-[260px] flex-1">
                            <div class="absolute top-0 left-full flex w-16 justify-center pt-4">
                                <button
                                    type="button"
                                    class="inline-flex size-10 items-center justify-center rounded-md text-atelier-ink"
                                    aria-label="Fermer le menu"
                                    @click="sidebarOpen = false">
                                    <XMarkIcon
                                        class="size-6"
                                        aria-hidden="true"/>
                                </button>
                            </div>
                            <SidebarContent
                                :navigation="navigation"
                                @logout="userLogout"
                                @navigate="sidebarOpen = false"
                            />
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </DialogComponent>
        </TransitionRoot>

        <!-- Barre latérale bureau -->
        <div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-60 lg:flex-col">
            <SidebarContent
                :navigation="navigation"
                @logout="userLogout"
            />
        </div>

        <div class="lg:pl-60">
            <div class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-atelier-line bg-atelier-panel/95 px-4 lg:hidden">
                <button
                    type="button"
                    class="inline-flex size-10 items-center justify-center rounded-md text-atelier-muted hover:text-atelier-ink"
                    aria-label="Ouvrir le menu"
                    @click="sidebarOpen = true">
                    <Bars3Icon
                        class="size-6"
                        aria-hidden="true"/>
                </button>
                <span class="font-fraunces text-lg font-medium">L'atelier</span>
            </div>
            <slot/>
        </div>
    </div>
</template>

<script setup lang="ts">
import {Dialog as DialogComponent, DialogPanel, TransitionChild, TransitionRoot} from '@headlessui/vue';
import {
    ArrowsUpDownIcon,
    Bars3Icon,
    BookOpenIcon,
    Cog6ToothIcon,
    GlobeAltIcon,
    HomeIcon,
    ListBulletIcon,
    XMarkIcon,
} from '@heroicons/vue/24/outline';
import {computed, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import SidebarContent from "~/components/admin/ui/AdminSidebarContent.vue";
import {useSession} from "~/utils/useSession";

const sidebarOpen = ref(false);
const route = useRoute();
const router = useRouter();

const items = [
    {name: 'Accueil', href: '/', icon: HomeIcon, exact: true},
    {name: 'Mon livre', href: '/book', icon: BookOpenIcon},
    {name: 'Contenus', href: '/content', icon: ListBulletIcon},
    {name: 'Importer du contenu', href: '/import', icon: ArrowsUpDownIcon},
    {name: 'Configuration', href: '/settings', icon: Cog6ToothIcon},
    {name: 'Mon site', href: '/', icon: GlobeAltIcon, exact: true, external: true},
];

const navigation = computed(() => items.map(item => ({
    ...item,
    current: !item.external && (item.exact ? route.path === item.href : route.path.startsWith(item.href)),
})));

const userLogout = async () => {
    await useSession().clear();
    await router.push('/login');
};
</script>
