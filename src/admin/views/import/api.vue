<template>
    <AdminPage>
        <template #title>Importer du contenu</template>
        <template #actions>
            <AdminNavTabs :tabs="tabs"/>
        </template>
        <ApiImportForm/>
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import ApiImportForm from "~/components/admin/import/ApiImportForm.vue";
import AdminNavTabs from "~/components/admin/ui/AdminNavTabs.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";

export default defineComponent({
    components: {AdminPage, ApiImportForm, AdminNavTabs},
    data() {
        return {
            tabs: [
                {name: 'Télécharger des fichiers', route: '/import', current: false},
                {name: 'Connecter une API', route: '/import/api', current: true},
            ],
        };
    },
});
</script>
