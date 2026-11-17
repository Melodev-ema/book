<template>
    <button
        type="button"
        class="inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilas disabled:cursor-not-allowed disabled:opacity-50"
        :class="
            [
                severityClass,
                loading ? 'cursor-not-allowed bg-opacity-75' : '',
                sizeClass
            ]"
        :disabled="loading || disabled"
        @click="$emit('click')"
    >
        <span class="flex items-center">
            <ArrowPathIcon
                v-if="loading"
                class="animate-spin h-5 w-5 mr-2"
                aria-hidden="true"
            />
            <span class="inline-flex items-center">
                <slot>{{ label }}</slot>
            </span>
        </span>
    </button>
</template>

<script lang="ts">
import ArrowPathIcon from "@heroicons/vue/24/outline/ArrowPathIcon";
import {defineComponent} from "vue";

export default defineComponent({
    name: "BaseButton",
    components: {ArrowPathIcon},
    props: {
        outlined: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        size: {
            type: [String, null],
            default: null,
        },
        label: {
            type: String,
            default: null,
        },
        severity: {
            type: String,
            default: 'info',
            validator: (value: string) => {
                return ['info', 'danger', 'success', 'warning'].includes(value);
            },
        },
    },
    emits: ['click'],
    computed: {
        sizeClass() {
            switch (this.size) {
                case 'xs':
                    return 'h-7 px-2 text-xs';
                case 'sm':
                    return 'h-8 px-2.5 text-[13px]';
                case 'md':
                    return 'h-9 px-3 text-sm';
                case 'lg':
                    return 'h-10 px-4 text-sm';
                case 'xl':
                    return 'h-12 px-5 text-[15px]';
                default:
                    return 'h-10 px-4 text-sm';
            }
        },
        severityClass() {
            const outlined: Record<string, string> = {
                info: 'border border-atelier-line-strong text-atelier-ink hover:border-atelier-subtle hover:bg-atelier-hover',
                danger: 'border border-danger/50 text-danger hover:bg-danger-soft',
                success: 'border border-menthe/50 text-menthe hover:bg-menthe-soft',
                warning: 'border border-warning/50 text-warning hover:bg-warning-soft',
            };
            const filled: Record<string, string> = {
                info: 'bg-lilas text-atelier-panel hover:bg-lilas-light',
                danger: 'bg-danger text-atelier-panel hover:bg-[#ffb0aa]',
                success: 'bg-menthe text-atelier-panel hover:bg-[#a3e0cd]',
                warning: 'bg-warning text-atelier-panel hover:bg-[#f7d99f]',
            };
            const map = this.outlined ? outlined : filled;
            return map[this.severity] ?? map.info;
        },
    },
});
</script>
