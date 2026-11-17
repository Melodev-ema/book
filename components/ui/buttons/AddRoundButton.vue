<template>
    <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md border border-dashed border-atelier-line-strong text-lilas transition-colors duration-150 hover:border-lilas hover:bg-lilas-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilas"
        aria-label="Ajouter"
        @click="$emit('click')"
    >
        <PlusIcon
            class="size-5"
            aria-hidden="true"/>
    </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {PlusIcon} from '@heroicons/vue/24/outline';

export default defineComponent({
    name: "AddButton",
    components: {PlusIcon},
    emits: ['click'],
});
</script>
