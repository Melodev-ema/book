<template>
    <AdminPage>
        <template #title>Importer du contenu</template>
        <template #actions>
            <AdminNavTabs :tabs="tabs"/>
        </template>
        <PoemImportForm/>
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import PoemImportForm from "~/components/admin/import/PoemImportForm.vue";
import AdminNavTabs from "~/components/admin/ui/AdminNavTabs.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";

export default defineComponent({
    components: {AdminPage, PoemImportForm, AdminNavTabs},
    data() {
        return {
            tabs: [
                {name: 'Télécharger des fichiers', route: '/import', current: true},
                {name: 'Connecter une API', route: '/import/api', current: false},
            ],
        };
    },
});
</script>
