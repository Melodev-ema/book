<template>
    <nav
        aria-label="Sections"
        class="sticky top-0 z-50 border-b border-atelier-line bg-atelier-panel/90 backdrop-blur-sm"
    >
        <div class="mx-auto flex h-16 max-w-7xl items-center gap-10 px-5 sm:px-8 lg:px-20">
            <a
                href="#top"
                class="flex min-w-0 items-center gap-2.5 text-atelier-ink"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                    class="shrink-0"
                ><path
                    d="M0 5h5V0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="text-lilas"
                /><path
                    d="M18 13h-5v5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="text-lilas"
                /></svg>
                <span class="truncate font-fraunces text-lg font-medium italic">{{ title }}</span>
            </a>
            <span class="flex-1"/>
            <ol class="hidden gap-8 text-sm font-medium md:flex">
                <li
                    v-for="(section, index) in sections"
                    :key="section.id"
                >
                    <a
                        :href="`#${section.id}`"
                        class="flex items-baseline gap-2 transition-colors duration-150 hover:text-atelier-ink"
                        :class="activeId === section.id ? 'text-atelier-ink' : 'text-atelier-muted'"
                        :aria-current="activeId === section.id ? 'location' : undefined"
                    >
                        <span class="font-fraunces text-xs text-menthe tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                        {{ section.label }}
                    </a>
                </li>
            </ol>
            <a
                href="#livre"
                class="flex h-10 shrink-0 items-center rounded-md bg-lilas px-4 text-sm font-semibold text-atelier-panel transition-colors duration-150 hover:bg-lilas-light"
            >
                Acheter le livre
            </a>
        </div>
    </nav>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";

defineProps<{
    title: string;
    sections: { id: string; label: string }[];
    // Chemin de la page (le fragment, lui, n'existe que dans le navigateur)
    currentPath: string;
}>();

const activeId = ref('');
const readHash = () => {
    activeId.value = window.location.hash.slice(1);
};

onMounted(() => {
    readHash();
    window.addEventListener('hashchange', readHash);
});
onBeforeUnmount(() => window.removeEventListener('hashchange', readHash));
</script>
