<template>
    <div class="flex flex-col gap-12">
        <SiteApiConfigurator/>
        <section
            aria-labelledby="connectors-title"
            class="flex flex-col gap-4"
        >
            <div>
                <h2
                    id="connectors-title"
                    class="text-base font-semibold text-atelier-ink">Connecteurs</h2>
                <p class="mt-1.5 text-sm text-atelier-muted">Importer directement depuis un service.</p>
            </div>
            <ApiConnectorsConfigurator/>
        </section>
    </div>
</template>
<script lang="ts">

import {defineComponent} from "vue";
import ApiConnectorsConfigurator from "~/components/admin/import/ApiConnectorsConfigurator.vue";
import SiteApiConfigurator from "~/components/admin/import/SiteApiConfigurator.vue";

export default defineComponent({
    name: "ApiImportForm",
    components: {SiteApiConfigurator, ApiConnectorsConfigurator},
});

</script>
