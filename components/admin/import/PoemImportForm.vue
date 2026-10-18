<template>
    <div class="grid grid-cols-1 gap-12 xl:grid-cols-2">
        <section
            aria-labelledby="import-files-title"
            class="flex flex-col gap-5"
        >
            <div>
                <h2
                    id="import-files-title"
                    class="text-base font-semibold text-atelier-ink">Fichiers</h2>
                <p class="mt-1.5 text-sm leading-relaxed text-atelier-muted">
                    Chaque fichier est converti puis analysé : titre, auteur, date et contenu sont extraits automatiquement.
                </p>
            </div>
            <form
                class="flex flex-col gap-5"
                @submit.prevent="startQueue"
            >
                <BaseDropzone
                    v-model:files="files"
                    label="Fichiers à importer"
                    :max-size="1024 * 50"
                    :max-files="20"
                    :accept="['application/json', 'text/csv', 'text/plain', 'text/html', 'text/markdown', 'application/vnd.oasis.opendocument.text', 'application/msword']"
                />
                <div class="flex items-center justify-end gap-2">
                    <CancelButton
                        v-if="files.length > 0"
                        @click="cancel"
                    >
                        Annuler
                    </CancelButton>
                    <BaseButton
                        :loading="submitting"
                        :disabled="files.length === 0 || submitting"
                        @click="startQueue"
                    >
                        {{ files.length > 1 ? `Importer ${files.length} fichiers` : 'Importer' }}
                    </BaseButton>
                </div>
            </form>
        </section>

        <section
            aria-labelledby="import-queue-title"
            class="flex flex-col gap-4"
        >
            <div class="flex items-baseline justify-between gap-4">
                <h2
                    id="import-queue-title"
                    class="text-base font-semibold text-atelier-ink">File d'import</h2>
                <span
                    v-if="queue.length > 0"
                    class="text-[13px] text-atelier-muted tabular-nums">
                    {{ completedCount }}/{{ queue.length }} traité{{ completedCount > 1 ? 's' : '' }}
                </span>
            </div>

            <template v-if="queue.length > 0">
                <div
                    role="progressbar"
                    :aria-valuenow="progressPercent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Progression de l'import"
                    class="h-1 w-full rounded-full bg-atelier-line"
                >
                    <div
                        class="h-1 rounded-full transition-all duration-300 motion-reduce:transition-none"
                        :class="hasErrors ? 'bg-warning' : 'bg-lilas'"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>

                <ul
                    role="list"
                    class="flex flex-col gap-1.5"
                >
                    <li
                        v-for="item in queue"
                        :key="item.id"
                        class="flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm"
                        :class="{
                            'border border-atelier-line': item.status === 'pending',
                            'bg-lilas-soft': item.status === 'processing',
                            'bg-menthe-soft': item.status === 'done',
                            'bg-danger-soft': item.status === 'error',
                        }"
                    >
                        <ClockIcon
                            v-if="item.status === 'pending'"
                            class="size-[18px] shrink-0 text-atelier-subtle"
                            aria-hidden="true"
                        />
                        <ArrowPathIcon
                            v-else-if="item.status === 'processing'"
                            class="size-[18px] shrink-0 animate-spin text-lilas-light motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                        <CheckCircleIcon
                            v-else-if="item.status === 'done'"
                            class="size-[18px] shrink-0 text-menthe"
                            aria-hidden="true"
                        />
                        <ExclamationCircleIcon
                            v-else-if="item.status === 'error'"
                            class="size-[18px] shrink-0 text-danger"
                            aria-hidden="true"
                        />
                        <span class="min-w-0 flex-1 truncate text-atelier-ink">{{ item.fileName }}</span>
                        <span
                            class="shrink-0 text-[13px]"
                            :class="{
                                'text-atelier-subtle': item.status === 'pending',
                                'text-lilas-light': item.status === 'processing',
                                'text-menthe': item.status === 'done',
                                'text-danger': item.status === 'error',
                            }"
                        >
                            <template v-if="item.status === 'done' && item.result">
                                {{ item.result.posts.success }} texte{{ item.result.posts.success > 1 ? 's' : '' }} créé{{ item.result.posts.success > 1 ? 's' : '' }}<template v-if="item.result.posts.error > 0"> · {{ item.result.posts.error }} erreur{{ item.result.posts.error > 1 ? 's' : '' }}</template>
                            </template>
                            <template v-else-if="item.status === 'error'">{{ item.errorMessage || 'Erreur lors de l\'import' }}</template>
                            <template v-else>{{ statusLabel(item.status) }}</template>
                        </span>
                    </li>
                </ul>

                <p
                    v-if="allDone"
                    role="status"
                    class="rounded-lg px-4 py-3 text-sm font-medium"
                    :class="hasErrors ? 'bg-warning-soft text-warning' : 'bg-menthe-soft text-menthe'"
                >
                    Import terminé — {{ totalSuccess }} contenu{{ totalSuccess > 1 ? 's' : '' }}
                    importé{{ totalSuccess > 1 ? 's' : '' }}<span v-if="totalErrors > 0">, {{ totalErrors }} erreur{{ totalErrors > 1 ? 's' : '' }}</span>
                </p>
            </template>
            <p
                v-else
                class="rounded-lg border border-dashed border-atelier-line px-4 py-10 text-center font-newsreader text-lg text-atelier-muted italic"
            >
                Aucun import en cours.
            </p>
        </section>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import BaseDropzone from "~/components/ui/BaseDropzone.vue";
import type {FileEntity} from "~/entities/FileEntity";
import CancelButton from "~/components/ui/buttons/CancelRoundButton.vue";
import {ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon} from "@heroicons/vue/24/outline";
import type {ImportJob} from "~/server/services/importQueue";
import {apiFetch} from "~/utils/api";
import {toast} from "~/utils/toast";

export default defineComponent({
    name: "PoemImportForm",
    components: {
        CancelButton,
        BaseDropzone,
        BaseButton,
        ClockIcon,
        CheckCircleIcon,
        ExclamationCircleIcon,
        ArrowPathIcon
    },
    data() {
        return {
            files: [] as FileEntity[],
            queue: [] as ImportJob[],
            submitting: false,
            pollingTimer: null as ReturnType<typeof setInterval> | null,
            toastShown: false,
        };
    },
    computed: {
        completedCount(): number {
            return this.queue.filter(i => i.status === 'done' || i.status === 'error').length;
        },
        progressPercent(): number {
            if (this.queue.length === 0) return 0;
            return Math.round((this.completedCount / this.queue.length) * 100);
        },
        hasErrors(): boolean {
            return this.queue.some(i => i.status === 'error');
        },
        allDone(): boolean {
            return this.queue.length > 0 && this.completedCount === this.queue.length;
        },
        totalSuccess(): number {
            return this.queue.reduce((sum, i) => sum + (i.result?.posts.success ?? 0), 0);
        },
        totalErrors(): number {
            return this.queue.reduce((sum, i) => sum + (i.result?.posts.error ?? 0), 0);
        },
    },
    async mounted() {
        await this.fetchJobs();
        if (!this.allDone && this.queue.length > 0) {
            this.startPolling();
        }
    },
    beforeUnmount() {
        this.stopPolling();
    },
    methods: {
        statusLabel(status: string): string {
            const labels: Record<string, string> = {
                pending: 'En attente',
                processing: 'Analyse en cours…',
                done: 'Terminé',
                error: 'Erreur',
            };
            return labels[status] || status;
        },
        async startQueue() {
            if (this.files.length === 0) return;

            this.submitting = true;
            this.toastShown = false;

            const formData = new FormData();
            for (const file of this.files) {
                formData.append('file' + file.id, file.file);
            }

            this.files = [];

            try {
                const response = await apiFetch<{ jobs: ImportJob[] }>('/api/import/queue', {
                    method: 'POST',
                    body: formData,
                });

                this.queue = response.jobs;
                this.startPolling();
            } catch {
                toast.error('Erreur lors de la soumission des fichiers');
            } finally {
                this.submitting = false;
            }
        },
        startPolling() {
            this.stopPolling();
            this.pollingTimer = setInterval(() => this.fetchJobs(), 2000);
        },
        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        },
        async fetchJobs() {
            try {
                const response = await apiFetch<{ jobs: ImportJob[] }>('/api/import/queue');
                this.queue = response.jobs;

                if (this.allDone && this.queue.length > 0) {
                    this.stopPolling();
                    if (!this.toastShown) {
                        this.toastShown = true;
                        const title = `Import terminé — ${this.totalSuccess} contenu${this.totalSuccess > 1 ? 's' : ''} importé${this.totalSuccess > 1 ? 's' : ''}`;
                        if (this.hasErrors) {
                            toast.warning(title);
                        } else {
                            toast.success(title);
                        }
                    }
                }
            } catch {
                // Silently ignore fetch errors during polling
            }
        },
        cancel() {
            this.files = [];
        },
    }
});

</script>
