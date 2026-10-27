<template>
    <BaseButton
        class="border-0! bg-transparent! text-atelier-muted! hover:bg-atelier-hover! hover:text-atelier-ink!"
        @click="$emit('click')"
    >
        <slot/>
    </BaseButton>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";

export default defineComponent({
    name: "CancelButton",
    components: {BaseButton},
    emits: ['click'],
});
</script>
