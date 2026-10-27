<template>
    <div class="flex flex-col gap-3">
        <span
            v-if="label.length > 0"
            class="text-[13px] text-atelier-muted">{{ label }}</span>
        <div
            ref="dropZoneRef"
            class="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed px-6 py-10 text-center transition-colors duration-150"
            :class="isOverDropZone ? 'border-lilas bg-lilas-soft' : 'border-atelier-line-strong bg-atelier-panel'"
        >
            <span
                class="flex size-11 items-center justify-center rounded-full bg-lilas-soft text-lilas-light"
                aria-hidden="true"
            >
                <ArrowUpTrayIcon class="size-5"/>
            </span>
            <label
                :for="inputId"
                class="cursor-pointer text-sm text-atelier-muted"
            >
                <span class="font-semibold text-atelier-ink underline decoration-atelier-line-strong underline-offset-4 hover:decoration-lilas">Choisir des fichiers</span>
                ou déposez-les ici
                <input
                    :id="inputId"
                    ref="fileInputRef"
                    name="file-upload[]"
                    type="file"
                    :multiple="maxFiles > 1"
                    class="sr-only"
                    :accept="accept.join(',')"
                    @change="addFile"
                >
            </label>
            <p class="text-xs text-atelier-subtle">{{ types }} — {{ maxFiles > 1 ? `${maxFiles} fichiers max., ` : '' }}{{ maxSizeMb }} max. par fichier</p>
        </div>
        <AdminAlert
            v-if="errors.length > 0"
            title="Certains fichiers n'ont pas été ajoutés"
            severity="danger"
            @close="errors = []"
        >
            <ul class="list-inside list-disc">
                <li
                    v-for="error in errors"
                    :key="error">{{ error }}
                </li>
            </ul>
        </AdminAlert>
        <ul
            v-if="fileList.length > 0"
            role="list"
            class="flex flex-col"
        >
            <li
                v-for="(file, index) in fileList"
                :key="index"
                class="flex h-12 items-center gap-3 border-b border-atelier-line text-sm"
            >
                <DocumentIcon
                    class="size-4 shrink-0 text-atelier-subtle"
                    aria-hidden="true"/>
                <span class="min-w-0 flex-1 truncate text-atelier-ink">{{ file.name }}</span>
                <span class="text-xs text-atelier-subtle tabular-nums">{{ getSize(file.size) }}</span>
                <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded-md text-atelier-subtle transition-colors duration-150 hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-lilas"
                    :aria-label="`Retirer ${file.name}`"
                    @click="removeFile(file)">
                    <TrashIcon
                        class="size-4"
                        aria-hidden="true"/>
                </button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import {useDropZone} from '@vueuse/core';
import {TrashIcon, DocumentIcon, ArrowUpTrayIcon} from "@heroicons/vue/24/outline";
import {FileEntity} from "~/entities/FileEntity";
import AdminAlert from "~/components/admin/ui/AdminAlert.vue";
import {toast} from "~/utils/toast";

export default defineComponent({
    name: "BaseDropzone",
    components: {AdminAlert, TrashIcon, DocumentIcon, ArrowUpTrayIcon},
    props: {
        accept: {
            type: Array<string>,
            default: ['image/jpeg', 'image/png', 'application/json'],
        },
        maxSize: {
            type: Number,
            default: 1024 * 1024 * 10,
        },
        maxFiles: {
            type: Number,
            default: 1,
        },
        label: {
            type: String,
            default: '',
        },
        files: {
            type: Array<FileEntity>,
            default: () => [],
        }
    },
    emits: ['update:files'],
    setup(props) {
        const dropZoneRef = ref<HTMLElement | null>(null);
        const fileList = ref<FileEntity[]>(props.files);
        const fileInputRef = ref<HTMLInputElement | null>(null);
        const errors = ref<string[]>([]);

        watch(
            () => props.files,
            (newFiles) => {
                fileList.value = newFiles;
                if (newFiles.length === 0 && fileInputRef.value) {
                    fileInputRef.value.value = '';
                }
            },
            {immediate: true}
        );

        const onDrop = (files: File[] | null) => {
            errors.value = [];
            if (files) {
                files.forEach(file => {
                    if (fileList.value.length >= props.maxFiles) {
                        toast.error('Erreur lors du téléchargement du fichier');
                        return;
                    }
                    if (file.size > props.maxSize) {
                        errors.value.push(`Le fichier ${file.name} est trop volumineux`);
                        return;
                    }
                    const id = file.name + new Date().getTime();
                    const fileEntity = new FileEntity(id, file.name, file.size, file.type, file);
                    fileList.value.push(fileEntity);
                });
            }
        };

        const {isOverDropZone} = useDropZone(dropZoneRef, {
            onDrop,
            dataTypes: props.accept,
            multiple: props.maxFiles > 1,
            preventDefaultForUnhandled: true,
        });

        return {
            fileInputRef,
            dropZoneRef,
            isOverDropZone,
            fileList,
            errors
        };
    },
    computed: {
        inputId(): string {
            return `dropzone-${this.label || 'fichiers'}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
        },
        maxSizeMb() {
            const mb = this.maxSize / 1024 / 1024;
            return mb >= 1 ? `${Math.round(mb * 10) / 10} Mo` : `${Math.round(this.maxSize / 1024)} Ko`;
        },
        types() {
            const labels: Record<string, string> = {
                'application/json': 'JSON',
                'text/csv': 'CSV',
                'text/plain': 'TXT',
                'text/html': 'HTML',
                'text/markdown': 'Markdown',
                'application/vnd.oasis.opendocument.text': 'ODT',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
                'image/jpeg': 'JPG',
                'image/png': 'PNG',
            };
            return this.accept.map(type => labels[type] ?? type.split('/').pop()?.toUpperCase()).join(' · ');
        }
    },
    methods: {
        getSize(size: number) {
            const sizes = ['Octet', 'Ko', 'Mo', 'Go', 'To'];
            if (size === 0) return '0 Octet';
            const i = Math.floor(Math.log(size) / Math.log(1024));
            return `${Math.round(size / Math.pow(1024, i) * 10) / 10} ${sizes[i]}`;
        },
        removeFile(file: FileEntity) {
            const newList = this.fileList.filter(f => f.id !== file.id);
            this.$emit('update:files', newList);

        },
        addFile(event: Event) {
            const files = Array.from((event.target as HTMLInputElement).files || []);

            if (files.length > 0) {
                files.forEach(file => {
                    if (file.size > this.maxSize) {
                        this.errors.push(`Le fichier ${file.name} est trop volumineux`);
                        return;
                    }
                    const id = file.name + new Date().getTime();
                    // check file exist in list
                    if (this.fileList.find(f => {
                        const fileItem = f.file as File;
                        return fileItem.name === file.name && fileItem.size === file.size && fileItem.lastModified === file.lastModified;
                    })) {
                        console.error('file exist');
                        return;
                    }

                    const fileEntity = new FileEntity(id, file.name, file.size, file.type, file);
                    this.fileList.push(fileEntity);
                });
            }
        }
    }
});

</script>
