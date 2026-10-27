<template>
    <section
        aria-labelledby="tokens-title"
        class="flex flex-col gap-4"
    >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2
                    id="tokens-title"
                    class="text-base font-semibold text-atelier-ink">Tokens d'accès</h2>
                <p class="mt-1.5 text-sm text-atelier-muted">
                    Pour envoyer des textes depuis un autre site via
                    <code class="font-mono text-[13px] text-atelier-ink">POST /api/v1/post</code>. Jusqu'à 5 tokens.
                </p>
            </div>
            <BaseButton
                v-if="tokens.length < 5 && !('new' in drafts)"
                outlined
                size="md"
                @click="addToken"
            >
                <PlusIcon
                    class="mr-1.5 -ml-0.5 size-4 text-lilas"
                    aria-hidden="true"/>
                Ajouter un token
            </BaseButton>
        </div>
        <BaseTable
            :columns="[
                { name: 'Nom', key: 'name', type: 'input' },
                { name: 'Token', key: 'token' },
                { name: 'Création', key: 'createdAt', type: 'date' },
                { name: 'Statut', key: 'revoked', type: 'status' },
                { name: 'Actions', key: 'actions', type: 'actions' },
            ]"
            :rows="rows"
            :limit="10"
            empty-label="Aucun token : ajoutez-en un pour connecter un site."
        >
            <template #column-name="{row}">
                <input
                    v-if="row.isEditing"
                    v-model="drafts[row.key]"
                    type="text"
                    aria-label="Nom"
                    class="h-9 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-2.5 outline-none text-sm text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                >
                <span
                    v-else
                    class="text-atelier-ink">{{ row.name }}</span>
            </template>
            <template #column-revoked="{row}">
                <BaseBadge
                    v-if="row.revoked"
                    size="sm"
                    severity="danger"
                >
                    Révoqué
                </BaseBadge>
                <BaseBadge
                    v-else
                    size="sm"
                    severity="success"
                >
                    Actif
                </BaseBadge>
            </template>
            <template #column-actions="{row}">
                <div class="flex justify-end gap-1.5">
                    <BaseButton
                        v-if="!row.isEditing"
                        label="Modifier"
                        outlined
                        size="sm"
                        @click="editToken(row)"
                    />
                    <BaseButton
                        v-if="!row.isEditing"
                        label="Révoquer"
                        outlined
                        severity="danger"
                        size="sm"
                        @click="revokeToken(row)"
                    />
                    <BaseButton
                        v-if="row.isEditing"
                        label="Annuler"
                        outlined
                        size="sm"
                        @click="cancelEditToken(row)"
                    />
                    <BaseButton
                        v-if="row.isEditing"
                        label="Enregistrer"
                        size="sm"
                        @click="saveToken(row)"
                    />
                </div>

            </template>
        </BaseTable>
    </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {ApiTokenEntityInterface} from "~/entities/ApiTokenEntity";
import BaseTable from "~/components/ui/BaseTable.vue";
import {PlusIcon} from "@heroicons/vue/24/outline";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import BaseBadge from "~/components/ui/buttons/BaseBadge.vue";
import {apiFetch, apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";

export default defineComponent({
    name: "SiteApiConfigurator",
    components: {BaseBadge, BaseButton, BaseTable, PlusIcon},
    data() {
        return {
            tokens: [] as ApiTokenEntityInterface[],
            // Nom en cours de saisie, par token édité (clé : son id, « new » pour le token en création)
            drafts: {} as Record<string, string>,
        };
    },
    computed: {
        rows() {
            return this.tokens
                .filter(token => !token.revoked)
                .map((token: ApiTokenEntityInterface) => {
                    const key = token.id === '' ? 'new' : String(token.id);
                    return {
                        ...token,
                        key,
                        createdAt: new Date(token.createdAt),
                        isEditing: key in this.drafts,
                    };
                });
        },
    },
    async mounted() {
        await this.getTokens();
    },
    methods: {
        async getTokens() {
            try {
                this.tokens = await apiFetch<ApiTokenEntityInterface[]>('/api/config/api-token') || [];
            } catch {
                toast.error('Erreur lors de la récupération des tokens');
            }
        },
        async revokeToken(token: ApiTokenEntityInterface) {
            const {data: tokenUpdated, error} = await apiTry<ApiTokenEntityInterface>('/api/config/api-token', {
                method: 'DELETE',
                body: {id: token.id},
            });

            if (error || !tokenUpdated) {
                toast.error('Erreur lors de la suppression du token');
                return;
            }
            this.tokens = this.tokens.filter(token => token.id !== tokenUpdated.id);
        },
        async saveToken(row: ApiTokenEntityInterface & {key: string}) {
            const isNew = row.key === 'new';
            const {data: tokenUpdated, error} = await apiTry<ApiTokenEntityInterface>('/api/config/api-token', {
                method: isNew ? 'POST' : 'PUT',
                body: isNew ? {name: this.drafts[row.key]} : {id: row.id, name: this.drafts[row.key]},
            });

            if (error || !tokenUpdated) {
                toast.error('Erreur lors de l\'enregistrement du token', {description: error?.message});
                return;
            }
            const index = this.tokens.findIndex(token => (isNew ? token.id === '' : token.id === row.id));
            this.tokens[index] = tokenUpdated;
            delete this.drafts[row.key];

            toast.success(isNew ? 'Le token a été créé' : 'Le token a été modifié avec succès');
        },
        editToken(row: ApiTokenEntityInterface & {key: string}) {
            this.drafts[row.key] = row.name;
        },
        addToken() {
            this.tokens.unshift({
                id: '',
                name: '',
                token: '',
                createdAt: new Date(),
                revoked: false,
                revokedAt: null,
            } as ApiTokenEntityInterface);
            this.drafts.new = '';
        },
        cancelEditToken(row: ApiTokenEntityInterface & {key: string}) {
            delete this.drafts[row.key];
            if (row.key === 'new') {
                this.tokens = this.tokens.filter(token => token.id !== '');
            }
        },
    },
});

</script>
