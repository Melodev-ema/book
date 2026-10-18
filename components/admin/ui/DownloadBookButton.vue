<template>
    <button
        type="button"
        class="no-print inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-atelier-line-strong text-[13px] font-semibold text-atelier-ink transition-colors duration-150 hover:border-atelier-subtle hover:bg-atelier-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilas disabled:cursor-wait disabled:opacity-60"
        :disabled="generating"
        @click="downloadBook">
        <ArrowPathIcon
            v-if="generating"
            class="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"/>
        <ArrowDownTrayIcon
            v-else
            class="size-4"
            aria-hidden="true"/>
        {{ generating ? 'Génération du PDF…' : 'Télécharger le PDF' }}
    </button>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ArrowDownTrayIcon, ArrowPathIcon} from "@heroicons/vue/24/outline";
import {apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";

export default defineComponent({
    name: "DownloadBookButton",
    components: {ArrowDownTrayIcon, ArrowPathIcon},
    data() {
        return {
            generating: false,
        };
    },

    methods: {
        async downloadBook() {
            this.generating = true;
            try {
                const {data: blob, error} = await apiTry<Blob>('/api/generate-pdf', {method: 'POST'});

                if (error || !blob) {
                    toast.error('Erreur lors de la génération du PDF');
                    return;
                }

                try {

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'Book.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    toast.success('Le livre a été téléchargé avec succès');
                } catch {
                    toast.error('Erreur lors de la génération du PDF');
                }

            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
            } finally {
                this.generating = false;
            }

        }
    }
});
</script>