<template>
    <div v-if="tabs.length > 0">
        <div class="grid grid-cols-1 sm:hidden">
            <select
                aria-label="Choisir un onglet"
                class="col-start-1 row-start-1 h-11 w-full appearance-none rounded-md border border-atelier-line-strong bg-atelier-panel pr-8 pl-3 text-[15px] text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                @change="onSelect"
            >
                <option
                    v-for="tab in tabs"
                    :key="tab.name"
                    :value="tab.route"
                    :selected="tab.current">{{ tab.name }}</option>
            </select>
            <ChevronDownIcon
                class="pointer-events-none col-start-1 row-start-1 mr-3 size-4 self-center justify-self-end text-atelier-subtle"
                aria-hidden="true"/>
        </div>
        <nav
            class="hidden gap-6 border-b border-atelier-line sm:flex"
            aria-label="Onglets">
            <RouterLink
                v-for="tab in tabs"
                :key="tab.name"
                :to="tab.route"
                class="flex h-11 items-center text-sm font-semibold whitespace-nowrap transition-colors duration-150"
                :class="tab.current ? 'text-atelier-ink shadow-[inset_0_-2px_0_var(--color-lilas)]' : 'text-atelier-muted hover:text-atelier-ink'"
                :aria-current="tab.current ? 'page' : undefined">{{ tab.name.trim() }}
            </RouterLink>
        </nav>
    </div>
</template>

<script lang="ts">
import {defineComponent, type PropType} from 'vue';
import {RouterLink} from 'vue-router';
import {ChevronDownIcon} from '@heroicons/vue/24/outline';
import type {Tab} from "~/components/admin/ui/Tab";

export default defineComponent({
    components: {ChevronDownIcon, RouterLink},
    props: {
        tabs: {
            type: Array as PropType<Tab[]>,
            default: () => [],
        },
    },
    methods: {
        onSelect(event: Event) {
            this.$router.push((event.target as HTMLSelectElement).value);
        },
    },
});
</script>
