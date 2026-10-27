<template>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0 flex-1">
            <h1 class="font-fraunces text-4xl leading-tight font-light tracking-tight text-atelier-ink sm:text-[40px]">
                <slot/>
            </h1>
            <p
                v-if="$slots.subtitle"
                class="mt-2 text-sm text-atelier-muted">
                <slot name="subtitle"/>
            </p>
        </div>
        <div class="flex shrink-0 gap-2">
            <slot name="buttons"/>
            <BaseButton
                v-if="editUrl"
                outlined
                @click="$router.push(editUrl)"
            >
                Modifier
            </BaseButton>
            <BaseButton
                v-if="addUrl"
                @click="$router.push(addUrl)"
            >
                <PlusIcon
                    class="mr-2 -ml-1 size-4"
                    aria-hidden="true"/>
                {{ addLabel }}
            </BaseButton>
        </div>
    </div>
</template>

<script>
import {PlusIcon} from '@heroicons/vue/24/outline';
import BaseButton from "~/components/ui/buttons/BaseButton.vue";

export default {
    components: {BaseButton, PlusIcon},
    props: {
        title: {
            type: String,
            default: '',
        },
        editUrl: {
            type: String,
            default: '',
        },
        addUrl: {
            type: String,
            default: '',
        },
        addLabel: {
            type: String,
            default: 'Ajouter',
        },
    },
};
</script>
