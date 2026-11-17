<template>
    <nav
        aria-label="Administration"
        class="flex h-full grow flex-col border-r border-atelier-line bg-atelier-panel"
    >
        <RouterLink
            to="/"
            class="flex h-16 shrink-0 items-center gap-2.5 px-5 text-atelier-ink"
            @click="$emit('navigate')"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 18 18"
                aria-hidden="true"
                class="text-lilas"
            ><path
                d="M0 5h5V0"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"/><path
                d="M18 13h-5v5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"/></svg>
            <span class="font-fraunces text-lg font-medium">L'atelier</span>
        </RouterLink>
        <ul
            role="list"
            class="flex flex-col gap-0.5 px-3 py-2"
        >
            <li
                v-for="item in navigation"
                :key="item.name"
            >
                <!-- « Mon site » sort de l'admin : lien classique hors du router -->
                <component
                    :is="item.external ? 'a' : RouterLink"
                    v-bind="item.external ? {href: item.href} : {to: item.href}"
                    class="flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-lilas"
                    :class="item.current ? 'bg-lilas-soft text-lilas-light' : 'text-atelier-muted hover:bg-atelier-hover hover:text-atelier-ink'"
                    :aria-current="item.current ? 'page' : undefined"
                    @click="$emit('navigate')"
                >
                    <component
                        :is="item.icon"
                        class="size-[18px] shrink-0"
                        aria-hidden="true"/>
                    <span class="flex-1">{{ item.name }}</span>
                    <ArrowUpRightIcon
                        v-if="item.external"
                        class="size-3.5 opacity-60"
                        aria-hidden="true"/>
                </component>
            </li>
        </ul>
        <div class="flex-1"/>
        <div class="flex flex-col gap-4 border-t border-atelier-line p-4">
            <DownloadBookButton/>
            <div class="flex items-center gap-2.5">
                <span
                    class="flex size-8 items-center justify-center rounded-full bg-lilas-soft text-xs font-semibold text-lilas-light"
                    aria-hidden="true">A</span>
                <span class="flex flex-1 flex-col">
                    <span class="text-[13px] font-medium">Administration</span>
                    <span class="text-xs text-atelier-subtle">Session ouverte</span>
                </span>
                <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded-md text-atelier-muted transition-colors duration-150 hover:bg-atelier-hover hover:text-atelier-ink focus-visible:outline-2 focus-visible:outline-lilas"
                    aria-label="Se déconnecter"
                    title="Se déconnecter"
                    @click="$emit('logout')"
                >
                    <ArrowRightStartOnRectangleIcon
                        class="size-[18px]"
                        aria-hidden="true"/>
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import type {Component} from 'vue';
import {RouterLink} from 'vue-router';
import {ArrowRightStartOnRectangleIcon, ArrowUpRightIcon} from '@heroicons/vue/24/outline';
import DownloadBookButton from "~/components/admin/ui/DownloadBookButton.vue";

defineProps<{
    navigation: {
        name: string;
        href: string;
        icon: Component;
        current: boolean;
        external?: boolean;
    }[];
}>();

defineEmits<{
    (event: 'logout' | 'navigate'): void;
}>();
</script>
