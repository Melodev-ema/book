<template>
    <AdminPage>
        <template #title>Contenus</template>
        <template #subtitle>
            {{ totalRecords }} texte{{ totalRecords > 1 ? 's' : '' }} dans le livre
        </template>
        <template #buttons>
            <BaseButton @click="$router.push('/content/add')">
                <PlusIcon
                    class="mr-2 -ml-1 size-4"
                    aria-hidden="true"/>
                Ajouter un contenu
            </BaseButton>
        </template>
        <BaseTable
            :columns="columns"
            :rows="posts"
            empty-label="Aucun texte pour l'instant : ajoutez-en un ou importez vos fichiers."
            @action="doAction"
        >
            <template #column-postTitle="{row}">
                <RouterLink
                    :to="`/content/${row.id}/edit`"
                    class="font-newsreader text-[17px] text-atelier-ink hover:text-lilas-light"
                >
                    {{ row.postTitle }}
                </RouterLink>
            </template>
        </BaseTable>
        <BasePagination
            class="mt-6 justify-end"
            :page="page"
            :count-page="countPage"
            :limit="limit"
            @prev-page="prevPage"
            @next-page="nextPage"
            @page="setPage"
        />
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {PlusIcon} from "@heroicons/vue/24/outline";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BasePagination from "~/components/BasePagination.vue";
import BaseTable from "~/components/ui/BaseTable.vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import type {PostInterface} from "~/server/models/post";
import PostEntity from "~/entities/PostEntity";
import type {PostEntityInterface} from "~/entities/PostEntity";
import {apiFetch, apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";

export default defineComponent({
    components: {AdminPage, BasePagination, BaseTable, BaseButton, PlusIcon},
    data() {
        return {
            columns: [
                {name: 'Titre', key: 'postTitle', bold: true},
                {name: 'Auteur', key: 'author'},
                {name: 'Date', key: 'date', type: 'date'},
                {name: '', key: 'actions', type: 'actions'},
            ],
            token: null,
            posts: [] as (PostEntityInterface & {actions: unknown[]})[],
            loaded: false,
            count: 1,
            page: 1,
            limit: 10,
            filters: {
                year: null
            },
            totalRecords: 0
        };
    },
    computed: {
        countPage(): number {
            if (this.totalRecords === 0) {
                return 0;
            }
            return Math.ceil(this.totalRecords / this.limit);
        }
    },
    async mounted() {
        await this.getPosts();
    },
    methods: {
        async prevPage() {
            this.page--;
            await this.getPosts();
        },
        async nextPage() {
            this.page++;
            await this.getPosts();
        },
        async setPage(page: number) {
            this.page = page;
            await this.getPosts();
        },
        async getPosts() {
            const {data, error} = await apiTry<{count: number; rows: PostInterface[]}>('/api/post', {query: {limit: this.limit, page: this.page}});
            if (error || !data) {
                toast.error('Impossible de charger les contenus');
                return;
            }
            this.totalRecords = data.count;
            this.posts = data.rows.map((post: PostInterface) => {
                const postEntity = PostEntity.hydrateFromDatabase(post);
                const actions = [
                    {
                        title: 'Modifier',
                        type: 'link',
                        actionType: 'edit',
                        action: `/content/${postEntity.id}/edit`,
                    },
                    {
                        title: 'Supprimer',
                        type: 'emit',
                        actionType: 'delete',
                        action: 'delete',
                    },
                ];

                return {
                    ...postEntity,
                    actions,
                };
            });
        },
        async doAction({action, row}: {action: string, row: PostEntityInterface}) {
            if (action === 'delete') {
                toast.error('Confirmation de suppression', {
                    id: 'delete',
                    description: `Supprimer « ${row.postTitle} » ? Cette action est définitive.`,
                    duration: Infinity,
                    action: {label: 'Supprimer', onClick: () => this.deletePost(row)},
                    cancel: {label: 'Annuler', onClick: () => {}},
                });
            }
        },
        async deletePost(post: PostEntityInterface) {
            try {
                await apiFetch(`/api/post/${post.id}`, {method: 'DELETE'});
            } catch {
                toast.error('Erreur lors de la suppression du contenu');
                return;
            }

            toast.success('Contenu supprimé avec succès');
            // Si on vient de vider la dernière page, on revient à la précédente
            if (this.posts.length === 1 && this.page > 1) {
                this.page--;
            }
            await this.getPosts();
        },

    }
});
</script>
