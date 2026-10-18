<template>
    <div :class="styles[size]">
        <slot/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: 'Container',
    props: {
        size: {
            type: String,
            default: 'sm',
            validator(value: string) {
                return ['xs', 'sm', 'md', 'lg'].includes(value);
            }
        }
    },
    setup() {
        const styles: Record<string, string> = {
            xs: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-2',
            sm: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12',
            md: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-5xl lg:px-8',
            lg: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-7xl lg:px-8',
        };

        return {
            styles
        };
    }
});
</script>
