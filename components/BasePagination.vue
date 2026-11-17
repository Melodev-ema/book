<template>
    <nav
        v-if="countPage > 1"
        aria-label="Pagination"
        class="flex items-center gap-1 text-sm"
        :class="tone === 'light' ? 'text-gray-600' : 'text-atelier-muted'"
    >
        <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-default disabled:opacity-40"
            :class="hoverClass"
            :disabled="page <= 1"
            aria-label="Page précédente"
            @click="prevPage"
        >
            <ChevronLeftIcon
                class="size-4"
                aria-hidden="true"/>
        </button>
        <template
            v-for="(pageNumber, index) in paginationPages"
            :key="index"
        >
            <span
                v-if="pageNumber === '...'"
                class="w-7 text-center opacity-60"
                aria-hidden="true"
            >…</span>
            <button
                v-else
                type="button"
                class="size-9 rounded-md tabular-nums transition-colors duration-150"
                :class="pageNumber === page ? currentClass : hoverClass"
                :aria-current="pageNumber === page ? 'page' : undefined"
                @click="$emit('page', pageNumber)"
            >
                {{ pageNumber }}
            </button>
        </template>
        <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-default disabled:opacity-40"
            :class="hoverClass"
            :disabled="page >= countPage"
            aria-label="Page suivante"
            @click="nextPage"
        >
            <ChevronRightIcon
                class="size-4"
                aria-hidden="true"/>
        </button>
    </nav>
</template>
<script lang="ts">
import {defineComponent, type PropType} from 'vue';
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/vue/24/outline";
import {paginationItems, type PaginationItem} from '~/utils/pagination';

export default defineComponent({
    components: {ChevronLeftIcon, ChevronRightIcon},
    props: {
        page: {
            type: Number,
            required: true
        },
        countPage: {
            type: Number,
            required: true
        },
        limit: {
            type: Number,
            default: 10,
        },
        tone: {
            type: String as PropType<'atelier' | 'light'>,
            default: 'atelier',
        },
    },
    emits: ['prevPage', 'nextPage', 'page'],
    computed: {
        paginationPages(): PaginationItem[] {
            return paginationItems(this.page, this.countPage);
        },
        hoverClass(): string {
            return this.tone === 'light' ? 'hover:bg-gray-100 hover:text-gray-900' : 'hover:bg-atelier-hover hover:text-atelier-ink';
        },
        currentClass(): string {
            return this.tone === 'light' ? 'bg-gray-900 font-semibold text-white' : 'bg-lilas-soft font-semibold text-lilas-light';
        },
    },
    methods: {
        prevPage() {
            if (this.page > 1) {
                this.$emit('prevPage');
            }
        },
        nextPage() {
            if (this.page < this.countPage) {
                this.$emit('nextPage');
            }
        }
    }

});
</script>
