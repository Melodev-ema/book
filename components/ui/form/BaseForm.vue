<template>
    <form
        class="flex flex-col gap-6"
        @submit.prevent="submit"
    >
        <div v-if="title || description">
            <h3
                v-if="title"
                class="text-base font-semibold text-atelier-ink">{{ title }}</h3>
            <p
                v-if="description"
                class="mt-1 text-sm text-atelier-muted">{{ description }}</p>
        </div>
        <slot/>
        <div class="flex items-center justify-end gap-2">
            <CancelButton @click="cancel">
                Annuler
            </CancelButton>
            <BaseButton
                :loading="loading"
                @click="submit">
                Enregistrer
            </BaseButton>
        </div>
    </form>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import CancelButton from "~/components/ui/buttons/CancelRoundButton.vue";

export default defineComponent({
    name: "BaseForm",
    components: {CancelButton, BaseButton},
    props: {
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        // Envoi en cours : bouton désactivé, et Entrée n'envoie pas une seconde fois
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['cancel', 'submit'],
    methods: {
        cancel() {
            this.$emit('cancel');
        },
        submit() {
            if (this.loading) {
                return;
            }
            this.$emit('submit');
        },
    }
});
</script>
