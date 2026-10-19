<template>
    <div
        class="page image-page text-center flex flex-col justify-center overflow-hidden relative">
        <img
            class="absolute inset-0 w-full h-full object-cover"
            :src="endPage?.url"
            alt=""
        >
    </div>
</template>

<script lang="ts">

import {computed} from "vue";
import {useBookStore} from "~/stores/bookStore";

export default {
    name: "EndPage",
    data() {
        const bookStore = useBookStore();
        return {
            endPage: computed(() => bookStore.getImagePageByType('back_cover')),
        };
    },
};

</script>
