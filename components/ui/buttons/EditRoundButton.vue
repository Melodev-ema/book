<template>
    <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md border border-atelier-line-strong text-atelier-muted transition-colors duration-150 hover:bg-atelier-hover hover:text-atelier-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilas"
        aria-label="Modifier"
        @click="$emit('click')"
    >
        <PencilIcon
            class="size-4"
            aria-hidden="true"/>
    </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {PencilIcon} from '@heroicons/vue/24/outline';

export default defineComponent({
    name: "EditRoundButton",
    components: {PencilIcon},
    emits: ['click'],
});
</script>
