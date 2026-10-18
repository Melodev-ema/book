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
                v-if="tokens.length < 5"
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
        <base-table
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
            <template #column-revoked="{row}">
                <base-badge
                    v-if="row.revoked"
                    size="sm"
                    severity="danger"
                >
                    Révoqué
                </base-badge>
                <base-badge
                    v-else
                    size="sm"
                    severity="success"
                >
                    Actif
                </base-badge>
            </template>
            <template #column-actions="{row, index}">
                <div class="flex justify-end gap-1.5">
                    <BaseButton
                        v-if="!row.isEditing"
                        label="Modifier"
                        outlined
                        size="sm"
                        @click="editToken(index)"
                    />
                    <BaseButton
                        v-if="!row.isEditing"
                        label="Révoquer"
                        outlined
                        severity="danger"
                        size="sm"
                        @click="revokeToken(row, index)"
                    />
                    <BaseButton
                        v-if="row.isEditing"
                        label="Annuler"
                        outlined
                        size="sm"
                        @click="cancelEditToken(index)"
                    />
                    <BaseButton
                        v-if="row.isEditing"
                        label="Enregistrer"
                        size="sm"
                        @click="saveToken(row, index)"
                    />
                </div>

            </template>
        </base-table>
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
            editingTokenIds: [] as number[],
        };
    },
    computed: {
        rows() {
            return this.tokens
                .filter(token => !token.revoked)
                .map((token: ApiTokenEntityInterface, index: number) => {
                    return {
                        ...token,
                        createdAt: new Date(token.createdAt),
                        isEditing: this.editingTokenIds.includes(index),
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
        async saveToken(token: ApiTokenEntityInterface, index: number) {
            const method = token.id === '' ? 'POST' : 'PUT';
            const {data: tokenUpdated, error} = await apiTry<ApiTokenEntityInterface>('/api/config/api-token', {
                method: method,
                body: token,
            });

            if (error || !tokenUpdated) {
                toast.error('Erreur lors de la modification du token');
                return;
            }
            const findIndex = this.tokens.findIndex(token => token.id === tokenUpdated.id || token.id === '');

            this.tokens[findIndex] = tokenUpdated;
            this.editingTokenIds = this.editingTokenIds.filter(id => id !== index);

            toast.success('Le token a été modifié avec succès');
        },
        editToken(index: number) {
            this.editingTokenIds.push(index);
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
            this.editingTokenIds.unshift(0);
        },
        cancelEditToken(index: number) {
            this.editingTokenIds = this.editingTokenIds.filter(id => id !== index);
            this.tokens = this.tokens.filter(token => token.id !== '');

        },
    },
});

</script>