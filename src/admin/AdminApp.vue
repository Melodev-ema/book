<template>
    <FragmentContainer>
        <AdminSidebar v-if="layout === 'admin'">
            <RouterView/>
        </AdminSidebar>
        <RouterView v-else/>
    </FragmentContainer>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance} from 'vue';
import {RouterView, useRoute} from 'vue-router';
import AdminSidebar from '~/components/admin/ui/AdminSidebar.vue';
import FragmentContainer from '~/components/layout/FragmentContainer.vue';
import {createAdminRouter} from './router';

// Astro crée l'appli Vue de l'îlot : on y branche le router depuis le composant racine
getCurrentInstance()!.appContext.app.use(createAdminRouter());

const route = useRoute();
// Pas de mise en page tant que la première navigation (garde de session) n'est pas résolue
const layout = computed(() => route.matched.length ? (route.meta.layout ?? 'admin') : null);
</script>
