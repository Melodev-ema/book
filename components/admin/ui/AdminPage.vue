<template>
    <main class="flex flex-col gap-8 px-5 pt-8 pb-16 sm:px-8 lg:px-14 lg:pt-10">
        <div
            v-if="$slots.title || $slots.actions"
            class="flex flex-col gap-5"
        >
            <AdminPageHeading v-if="$slots.title">
                <slot name="title"/>
                <template
                    v-if="$slots.subtitle"
                    #subtitle>
                    <slot name="subtitle"/>
                </template>
                <template
                    v-if="$slots.buttons"
                    #buttons>
                    <slot name="buttons"/>
                </template>
            </AdminPageHeading>
            <slot name="actions"/>
        </div>
        <div>
            <slot/>
        </div>
    </main>
</template>
<script setup lang="ts">
// Les boutons d'en-tête passent par le slot #buttons de chaque page
import AdminPageHeading from "~/components/admin/ui/AdminPageHeading.vue";
</script>
