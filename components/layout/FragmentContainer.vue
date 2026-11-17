<template>
    <div class="fragment">
        <slot/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: "FragmentContainer",
});
</script>

<style scoped>
.fragment {
    display: contents;
}
</style>
