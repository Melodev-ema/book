<template>
    <Toaster :position="position"/>
</template>

<script lang="ts">
import {defineComponent, type PropType} from 'vue';
import {Toaster, type ToasterProps} from 'vue-sonner';
import 'vue-sonner/style.css';

// Enveloppe .vue : astro check ne sait pas typer un composant Vue importé d'un paquet
export default defineComponent({
    components: {Toaster},
    props: {
        position: {type: String as PropType<ToasterProps['position']>, default: 'top-right'},
    },
});
</script>
