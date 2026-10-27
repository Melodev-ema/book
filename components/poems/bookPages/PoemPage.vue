<script setup lang="ts">

import SafeHtml from "~/components/layout/SafeHtml.vue";
</script>

<template>
    <div class="page text-left flex flex-col gap-4 relative">

        <div
            v-if="prevPageId !== id"
            class="mt-8">
            <h2 class="title text-left pl-10 flex normal-case">
                <span
                    v-for="(titleLine, i) in contentSplit(title)"
                    :key="titleLine"
                >
                    <span v-if="i === 0">
                        {{ titleLine }}
                    </span>
                    <span
                        v-else
                        class="italic">
                        ~ {{ titleLine }}
                    </span>
                </span>
            </h2>
        </div>
        <header
            v-else
            class="text-gray-500 italic flex gap-4 normal-case"
        >
            <div
                v-for="titleLine in contentSplit(title)"
                :key="titleLine">
                {{ titleLine }}
            </div>
        </header>
        <div>
            <div
                v-for="(contentLine, lineIndex) in contentLines"
                :key="lineIndex"
                :class="contentSplit(contentLine)?.length > 1 ? 'grid grid-cols-2 gap-6' : ''"
            >
                <div
                    v-for="(contentLinePart, partIndex) in contentSplit(contentLine)"
                    :key="partIndex"
                    class="min-h-4 first-letter:uppercase">
                    <SafeHtml :raw-html="contentLinePart"/>
                </div>
            </div>
        </div>
        <div
            v-if="showSignature && nextPageId !== id"
            class="mt-10 font-medium text-left pl-10"
        >
            {{ signature }}
        </div>
        <footer>
            {{ page }}
        </footer>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {formatSignature} from '~/utils/signature';

export default defineComponent({
    props: {
        id: {
            type: Number,
            required: true
        },
        // Absents en début et fin de livre
        nextPageId: {
            type: Number,
            default: undefined
        },
        prevPageId: {
            type: Number,
            default: undefined
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        page: {
            type: Number,
            required: true
        },
        showSignature: {
            type: Boolean,
            default: true
        },
    },
    computed: {
        contentLines() {
            //keep the line breaks and the empty lines
            return this.content.split('\n');
        },
        signature(): string {
            return formatSignature(this.author, this.date);
        }
    },
    methods: {
        contentSplit(contentLine: string) {
            return contentLine.split('_');
        }
    }
});

</script>

<style scoped>

</style>
