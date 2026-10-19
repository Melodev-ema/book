<template>
    <Teleport to="body">
        <BaseDrawer
            :open="open"
            @close="$emit('close')"
        >
            <template #title>{{ title }}</template>
            <template #description>{{ description }}</template>
            <div
                class="flex flex-col gap-4"
            >
                <BaseDropzone
                    v-model:files="files"
                    class="w-full"
                    :max-size="maxSize"
                    :max-files="maxFiles"
                    :accept="accept"
                />
                <figure
                    v-if="image"
                    class="flex flex-col gap-2"
                >
                    <figcaption class="text-[13px] text-atelier-muted">Image actuelle</figcaption>
                    <img
                        :src="image.url"
                        :alt="title"
                        class="max-h-80 w-fit rounded-[2px] shadow-page"
                    >
                </figure>
                <SaveButton
                    class="self-end"
                    :disabled="!filesChanged"
                    @click="submit(files, pageType)"
                >
                    Enregistrer
                </SaveButton>
            </div>
        </BaseDrawer>
    </Teleport>
</template>

<script lang="ts">
import {defineComponent, type PropType} from "vue";
import BaseDrawer from "~/components/ui/BaseDrawer.vue";
import BaseDropzone from "~/components/ui/BaseDropzone.vue";
import type {FileEntityInterface} from "~/entities/FileEntity";
import type {AttachmentEntityInterface} from "~/entities/AttachmentEntity";
import SaveButton from "~/components/ui/buttons/SaveButton.vue";
import {IMAGE_PAGE_TYPES} from "~/utils/imagePageTypes";

export default defineComponent({
    name: 'ImportImage',
    components: {SaveButton, BaseDropzone, BaseDrawer},
    props: {
        pageType: {
            type: String,
            default: () => {
                return null;
            },
            validator: (value: string) => {
                return IMAGE_PAGE_TYPES.includes(value);
            },
        },
        image: {
            type: Object as PropType<AttachmentEntityInterface | null>,
            default: () => {
                return null;
            },
        },
        open: {
            type: Boolean,
            default: false,
        }
    },
    emits: ['close', 'submit'],
    data() {
        return {
            accept: ['image/jpeg', 'image/png'],
            maxSize: 1024 * 1024 * 10,
            maxFiles: 1,
            files: [] as FileEntityInterface[],
            filesChanged: false,
        };
    },
    computed: {
        title(): string {
            const verb = this.image ? 'Remplacer' : 'Ajouter';
            if (this.pageType === 'author_portrait') {
                return `${verb} la photo de l'auteur`;
            }
            return this.pageType === 'back_cover' ? `${verb} la page de fin` : `${verb} la page de couverture`;
        },
        description(): string {
            if (this.pageType === 'author_portrait') {
                return 'Portrait affiché dans la section « L\'auteur » de la page d\'accueil (cadrage vertical 4:5).';
            }
            return this.pageType === 'back_cover'
                ? 'Cette image ferme le livre, après le dernier texte.'
                : 'Cette image ouvre le livre et sert de couverture sur la page d\'accueil.';
        },
    },
    watch: {
        files: {
            handler() {
                this.filesChanged = this.files.length > 0;
            },
            deep: true
        },
        open: {
            handler(newValue: boolean) {
                if (!newValue) {
                    this.files = [];
                }
            },
            deep: true
        }
    },
    methods: {
        submit(files: FileEntityInterface[], pageType: string) {
            this.$emit('submit', files, pageType);
        },
    }
});
</script>
