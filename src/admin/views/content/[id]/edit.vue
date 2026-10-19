<template>
    <AdminPage>
        <template #title>Modifier le contenu</template>
        <template #subtitle>
            <RouterLink
                to="/content"
                class="inline-flex items-center gap-1.5 text-atelier-muted hover:text-atelier-ink"
            >
                <ArrowLeftIcon
                    class="size-4"
                    aria-hidden="true"/>
                Retour aux contenus
            </RouterLink>
        </template>
        <p
            v-if="notFound"
            class="py-16 text-center text-atelier-muted"
        >
            Ce texte n'existe pas ou a été supprimé.
        </p>
        <BaseForm
            v-if="post"
            :loading="submitting"
            @cancel="cancel"
            @submit="submit"
        >
            <BaseInput
                v-model="post.postTitle"
                name="postTitle"
                label="Titre"
                serif
            />
            <BaseInput
                v-model="post.author"
                name="author"
                label="Auteur"
            />
            <TextEditor
                v-model="post.content"
                name="content"
                label="Contenu"
            />
        </BaseForm>
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BaseForm from "~/components/ui/form/BaseForm.vue";
import BaseInput from "~/components/ui/form/BaseInput.vue";
import type {PostEntityInterface} from "~/entities/PostEntity";
import TextEditor from "~/components/ui/form/TextEditor.vue";
import {ArrowLeftIcon} from "@heroicons/vue/24/outline";
import {apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";
import {missingPostField} from "~/utils/postForm";

export default defineComponent({
    components: {AdminPage, TextEditor, BaseForm, BaseInput, ArrowLeftIcon},
    data() {
        return {
            post: null as PostEntityInterface | null,
            notFound: false,
            submitting: false,
        };
    },
    computed: {
        id(): string {
            return String(this.$route.params.id);
        },
    },
    async mounted() {
        const {data, error} = await apiTry<PostEntityInterface>(`/api/post/${this.id}`);
        if (error?.status === 404) {
            this.notFound = true;
            return;
        }
        if (error) {
            toast.error('Erreur lors de la récupération du contenu');
            return;
        }
        this.post = data;
    },
    methods: {
        async cancel() {
            await this.$router.push('/content');
        },
        async submit() {
            if (!this.post) {
                return;
            }
            const missing = missingPostField(this.post);
            if (missing) {
                toast.error(missing);
                return;
            }

            this.submitting = true;
            const {error} = await apiTry('/api/post', {
                method: 'POST',
                body: this.post,
            });
            this.submitting = false;

            if (error) {
                toast.error('Erreur lors de la modification du contenu', {description: error.message});
                return;
            }

            toast.success('Contenu modifié avec succès');
            await this.$router.push('/content');
        }
    }
});
</script>
