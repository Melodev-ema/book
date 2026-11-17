<template>
    <AdminPage>
        <template #title>Mon livre</template>
        <template #actions>
            <AdminNavTabs :tabs="tabs"/>
        </template>
        <div class="flex flex-col gap-10">
            <div class="flex flex-wrap gap-4">
                <div
                    v-for="pageSlot in pageSlots"
                    :key="pageSlot.type"
                    class="flex w-full items-center gap-4 rounded-[10px] border p-3.5 pr-4 sm:w-80"
                    :class="pageSlot.image ? 'border-atelier-line bg-atelier-panel' : 'border-dashed border-atelier-line-strong'"
                >
                    <img
                        v-if="pageSlot.image"
                        :src="pageSlot.image.url"
                        :alt="pageSlot.label"
                        class="h-16 w-12 shrink-0 rounded-[2px] object-cover shadow-page"
                    >
                    <span
                        v-else
                        class="flex h-16 w-12 shrink-0 items-center justify-center rounded-[2px] border border-dashed border-atelier-line-strong text-lilas"
                        aria-hidden="true"
                    >
                        <PlusIcon class="size-5"/>
                    </span>
                    <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span class="text-sm font-semibold text-atelier-ink">{{ pageSlot.image ? pageSlot.label : pageSlot.addLabel }}</span>
                        <span class="truncate text-xs text-atelier-subtle">{{ pageSlot.image ? pageSlot.image.name : 'Image JPG ou PNG' }}</span>
                    </span>
                    <EditRoundButton
                        v-if="pageSlot.image"
                        :aria-label="`Remplacer : ${pageSlot.label}`"
                        @click="openModalPage(pageSlot.type)"
                    />
                    <AddButton
                        v-else
                        :aria-label="pageSlot.addLabel"
                        @click="openModalPage(pageSlot.type)"
                    />
                </div>
            </div>

            <BaseBook
                v-if="posts.length"
                :total-records="totalRecords"
                :posts="posts"
                :limit="limit"
                @page="setPage"
                @limit="limit = $event"
            />
            <p
                v-else
                class="py-16 text-center font-newsreader text-lg text-atelier-muted italic"
            >
                Le livre est encore vide : ajoutez ou importez des textes.
            </p>
        </div>
        <ImportImage
            v-if="modalPageType"
            :open="showModalPage"
            :page-type="modalPageType"
            :image="modalImage(modalPageType)"
            @submit="saveFiles"
            @close="showModalPage = false"
        />
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import PostEntity, {type PostEntityInterface} from "~/entities/PostEntity";
import BaseBook from "~/components/poems/BaseBook.vue";
import type {PostInterface} from "~/server/models/post";
import AddButton from "~/components/ui/buttons/AddRoundButton.vue";
import {PlusIcon} from "@heroicons/vue/24/outline";
import type {AttachmentEntityInterface} from "~/entities/AttachmentEntity";
import EditRoundButton from "~/components/ui/buttons/EditRoundButton.vue";
import ImportImage from "~/components/admin/book/ImportImage.vue";
import AdminNavTabs from "~/components/admin/ui/AdminNavTabs.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import {ApiError, apiFetch, apiTry} from "~/utils/api";
import {groupByPart, type BookPart} from "~/utils/bookToc";
import {toast} from "~/utils/toast";

export default defineComponent({
    components: {
        AdminPage,
        AdminNavTabs,
        ImportImage,
        EditRoundButton,
        AddButton,
        BaseBook,
        PlusIcon
    },
    data() {
        return {
            tabs: [
                {name: 'Mon livre', route: '/book', current: true},
                {name: 'Parties', route: '/book/parts', current: false},
                {name: 'Configuration', route: '/book/settings', current: false},
            ],
            images: [] as AttachmentEntityInterface[],
            // Tous les textes, dans l'ordre du livre (parties et positions)
            bookPosts: [] as PostEntityInterface[],
            page: 1,
            limit: 1,
            savingImage: false,
            showModalPage: false,
            modalPageType: null as string | null,
        };
    },
    computed: {
        posts(): PostEntityInterface[] {
            return this.bookPosts.slice((this.page - 1) * this.limit, this.page * this.limit);
        },
        totalRecords(): number {
            return this.bookPosts.length;
        },
        coverPage(): AttachmentEntityInterface | null {
            return this.images.find(image => image.pageType === 'cover') || null;
        },
        backCoverPage(): AttachmentEntityInterface | null {
            return this.images.find(image => image.pageType === 'back_cover') || null;
        },
        pageSlots() {
            return [
                {type: 'cover', label: 'Page de couverture', addLabel: 'Ajouter une page de couverture', image: this.coverPage},
                {type: 'back_cover', label: 'Page de fin', addLabel: 'Ajouter une page de fin', image: this.backCoverPage},
            ];
        }
    },
    async mounted() {
        await this.getPosts();
        await this.getImages();
    },
    methods: {
        setPage(page: number) {
            this.page = page;
        },
        async getPosts() {
            const [posts, parts] = await Promise.all([
                apiTry<{rows: PostInterface[]}>('/api/post', {query: {limit: 'all'}}),
                apiTry<BookPart[]>('/api/part'),
            ]);
            if (!posts.data || !parts.data) {
                toast.error('Impossible de charger le livre');
                return;
            }
            const entities = posts.data.rows.map((post: PostInterface) => PostEntity.hydrateFromDatabase(post));
            this.bookPosts = groupByPart(entities, parts.data).flatMap(section => section.posts);
        },
        async getImages() {
            const {data, error} = await apiTry<AttachmentEntityInterface[]>('/api/image');
            if (error || !data) {
                return;
            }
            this.images = data;
        },
        openModalPage(type: string) {
            this.showModalPage = true;
            this.modalPageType = type;
        },
        modalImage(type: string) {
            return this.images.find(image => image.pageType === type) || null;
        },
        saveFiles(files: File[], pageType: string) {
            if (this.savingImage) {
                return;
            }
            const entity = files[0];
            const file = entity.file as File;
            const formData = new FormData();
            formData.append('file', file, file.name);
            formData.append('data', pageType);
            this.savingImage = true;
            apiFetch<AttachmentEntityInterface[]>('/api/import/image', {
                method: 'POST',
                body: formData
            })
                .then(data => {
                    this.images = data;
                    this.showModalPage = false;

                    toast.success('L\'image a été enregistrée avec succès');
                })
                .catch((error) => {
                    toast.error(error instanceof ApiError && error.status === 413
                        ? 'Image trop lourde (10 Mo maximum)'
                        : 'Erreur lors de l\'enregistrement de l\'image');
                })
                .finally(() => {
                    this.savingImage = false;
                });

        },
    }
});

</script>
