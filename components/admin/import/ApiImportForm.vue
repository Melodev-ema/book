<template>
    <div class="flex flex-col gap-12">
        <SiteApiConfigurator/>
    </div>
</template>
<script lang="ts">

import {defineComponent} from "vue";
import SiteApiConfigurator from "~/components/admin/import/SiteApiConfigurator.vue";

export default defineComponent({
    name: "ApiImportForm",
    components: {SiteApiConfigurator},
});

</script>
