<template>
    <dl class="grid grid-cols-1 border-t border-atelier-ink/80 sm:grid-cols-2">
        <div
            v-for="(stat, key) in stats"
            :key="key"
            class="flex flex-col gap-2.5 border-atelier-line py-6 not-first:border-t sm:not-first:border-t-0 sm:odd:pr-6 sm:even:pl-6 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
        >
            <dt class="text-[13px] text-atelier-muted">{{ stat.name }}</dt>
            <dd
                class="order-first font-fraunces text-6xl leading-none font-light tracking-tight tabular-nums"
                :class="stat.value ? 'text-atelier-ink' : 'text-atelier-subtle'"
            >
                {{ stat.value }}
            </dd>
        </div>
    </dl>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {apiTry} from '~/utils/api';
import {toast} from '~/utils/toast';

const stats = ref<Record<string, {name: string; value: number}> | null>(null);

onMounted(async () => {
    const {data, error} = await apiTry<typeof stats.value>('/api/stats');
    if (error) {
        toast.error('Impossible de charger les statistiques');
        return;
    }
    stats.value = data;
});
</script>
