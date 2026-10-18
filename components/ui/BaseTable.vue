<template>
    <div class="flow-root">
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="column.key"
                            scope="col"
                            class="border-b border-atelier-ink/80 pr-4 pb-3 text-left text-xs font-medium whitespace-nowrap text-atelier-muted"
                        >
                            <span :class="{ 'sr-only': column.type === 'actions' }">{{ column.name || 'Actions' }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(row, index) in rows"
                        :key="index"
                        class="transition-colors duration-100 hover:bg-atelier-hover/60">
                        <td
                            v-for="column in columns"
                            :key="column.key"
                            :class="[
                                column.bold ? 'font-medium text-atelier-ink' : 'text-atelier-muted',
                                'h-13 border-b border-atelier-line pr-4 whitespace-nowrap',
                                column.type === 'actions' ? 'w-[1%] pr-0' : ''
                            ]">
                            <slot
                                :name="`column-${column.key}`"
                                :row="row"
                                :index="index"
                            >
                                <template v-if="column.type === 'input'">
                                    <input
                                        v-if="row.isEditing"
                                        v-model="row[column.key]"
                                        type="text"
                                        :aria-label="column.name"
                                        class="h-9 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-2.5 outline-none text-sm text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                                    >
                                    <template v-else>
                                        <span class="text-atelier-ink">{{ row[column.key] }}</span>
                                    </template>
                                </template>
                                <template v-else-if="column.type === 'date'">
                                    <span class="tabular-nums">{{ row[column.key].toLocaleDateString('fr') }}</span>
                                </template>
                                <template v-else-if="column.type === 'status'">
                                    <span
                                        v-if="row[column.key]"
                                        class="rounded bg-menthe-soft px-2 py-0.5 text-xs font-semibold text-menthe">Activé</span>
                                    <span
                                        v-else
                                        class="rounded bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">Désactivé</span>
                                </template>
                                <template v-else-if="column.type === 'actions'">
                                    <div class="flex justify-end gap-0.5">
                                        <template
                                            v-for="(action, aindex) in row.actions"
                                            :key="aindex">
                                            <RouterLink
                                                v-if="action.type === 'link'"
                                                :to="action.action"
                                                :aria-label="action.title"
                                                :title="action.title"
                                                class="inline-flex size-9 items-center justify-center rounded-md text-atelier-muted transition-colors duration-150 hover:bg-atelier-raised hover:text-atelier-ink focus-visible:outline-2 focus-visible:outline-lilas"
                                            >
                                                <component
                                                    :is="actionIcon(action.actionType)"
                                                    class="size-4"
                                                    aria-hidden="true"
                                                />
                                            </RouterLink>
                                            <button
                                                v-else-if="action.type === 'emit'"
                                                type="button"
                                                :aria-label="action.title"
                                                :title="action.title"
                                                class="inline-flex size-9 items-center justify-center rounded-md text-atelier-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-lilas"
                                                :class="action.actionType === 'delete' ? 'hover:bg-danger-soft hover:text-danger' : 'hover:bg-atelier-raised hover:text-atelier-ink'"
                                                @click="$emit('action', {action: action.action, row})"
                                            >
                                                <component
                                                    :is="actionIcon(action.actionType)"
                                                    class="size-4"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </template>
                                    </div>
                                </template>
                                <template v-else>
                                    {{ row[column.key] }}
                                </template>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p
                v-if="rows.length === 0"
                class="py-16 text-center font-newsreader text-lg text-atelier-muted italic"
            >
                {{ emptyLabel }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, type PropType} from 'vue';
import {RouterLink} from 'vue-router';
import {PencilIcon, TrashIcon, EllipsisHorizontalIcon} from "@heroicons/vue/24/outline";

interface Row {
    [key: string]: string;
}

interface Column {
    name: string;
    key: string;
    bold?: boolean;
    type?: string;
}

export default defineComponent({
    components: {RouterLink},
    props: {
        columns: {
            type: Array as PropType<Column[]>,
            default: () => [],
        },
        rows: {
            type: Array as PropType<Row[]>,
            default: () => [],
        },
        emptyLabel: {
            type: String,
            default: 'Aucun résultat pour le moment.',
        },
    },
    emits: ['action'],
    methods: {
        actionIcon(actionType?: string) {
            if (actionType === 'edit') {
                return PencilIcon;
            }
            if (actionType === 'delete') {
                return TrashIcon;
            }
            return EllipsisHorizontalIcon;
        },
    },
});

</script>
