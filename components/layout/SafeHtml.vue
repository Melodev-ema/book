<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="safeHtml"/>
</template>

<script lang="ts">

// dans votre composant
import DOMPurify from 'dompurify';
import {sanitizeHtml} from '~/utils/htmlSanitizer';

export default {
    props: {
        rawHtml: {
            type: String,
            required: true
        }
    },
    computed: {
        safeHtml() {
            // supprime tout ce qui peut être dangereux
            return sanitizeHtml(DOMPurify, this.rawHtml);
        }
    }
};

</script>
