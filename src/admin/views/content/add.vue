<template>
    <AdminPage>
        <template #title>Nouveau contenu</template>
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
        <BaseForm
            @cancel="cancel"
            @submit="submit"
        >
            <BaseInput
                v-model="post.postTitle"
                name="postTitle"
                label="Titre"
                serif
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
import PostEntity, {type PostEntityInterface} from "~/entities/PostEntity";
import TextEditor from "~/components/ui/form/TextEditor.vue";
import {ArrowLeftIcon} from "@heroicons/vue/24/outline";
import {apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";

export default defineComponent({
    components: {AdminPage, TextEditor, BaseForm, BaseInput, ArrowLeftIcon},
    data() {
        return {
            post: PostEntity.create() as PostEntityInterface,
        };
    },
    methods: {
        async cancel() {
            await this.$router.push('/content');
        },
        async submit() {
            const {error} = await apiTry('/api/post', {
                method: 'POST',
                body: this.post,
            });

            if (error) {
                toast.error('Erreur lors de la création du contenu');
                return;
            }

            toast.success('Contenu créé avec succès');
            await this.$router.push('/content');
        }
    }
});
</script>
