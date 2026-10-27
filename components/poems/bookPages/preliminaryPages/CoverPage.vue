<template>
    <div
        class="page image-page text-center flex flex-col justify-center overflow-hidden relative">
        <img
            class="absolute inset-0 w-full h-full object-cover"
            :src="coverPage?.url"
            :alt="`Couverture de ${title}`"
        >
    </div>
</template>

<script lang="ts">

import {computed} from "vue";
import {useBookStore} from "~/stores/bookStore";

export default {
    name: "CoverPage",
    data() {
        const bookStore = useBookStore();
        return {
            coverPage: computed(() => bookStore.getImagePageByType('cover')),
            title: computed(() => bookStore.config.title),
        };
    },
};

</script>
