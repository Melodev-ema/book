<template>

    <div class="flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    v-for="(column, index) in columns"
                                    :key="index"
                                    scope="col"
                                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    {{ column.name }}
                                </th>

                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr
                                v-for="(row,index) in rows"
                                :key="index">
                                <td
                                    v-for="(column, indexCol) in columns"
                                    :key="indexCol"
                                    class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                >
                                    {{ row[column.key] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type {PropType} from "vue";

interface Row {
    [key: string]: string;
}

interface Column {
    name: string;
    key: string;
    bold?: boolean;
    type?: string;
}

export default {
    name: "CardTable",
    props: {
        columns: {
            type: Array as PropType<Column[]>,
            default: () => [],
        },
        rows: {
            type: Array as PropType<Row[]>,
            default: () => [],
        },
    },
    data() {
        return {
            people: [
                {
                    id: 1,
                    name: 'Lindsay Walton',
                    title: 'Front-end Developer',
                    email: 'lindsay.walton@example.com',
                    role: 'Member',
                },
                {
                    id: 2,
                    name: 'Dana Keith',
                    title: 'Regional Paradigm Technician',
                    email: 'dana.keith@example.com',
                    role: 'Staff',
                },
            ],
        };
    },
};

</script>
