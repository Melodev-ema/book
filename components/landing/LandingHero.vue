<template>
    <header
        id="top"
        class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-20 lg:pt-28 lg:pb-24"
    >
        <div class="flex flex-col gap-7 lg:col-span-7">
            <p class="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] text-atelier-muted uppercase">
                <span class="text-menthe">{{ genre }}</span>
                <span
                    class="h-px w-6 bg-atelier-line-strong"
                    aria-hidden="true"
                />
                <span>{{ pagesLabel }}</span>
            </p>
            <h1 class="font-fraunces text-6xl leading-[0.95] font-light tracking-[-0.035em] text-balance text-atelier-ink sm:text-7xl lg:text-8xl">
                {{ title }}
            </h1>
            <p
                v-if="author"
                class="font-newsreader text-2xl text-atelier-ink italic"
            >
                {{ author }}
            </p>
            <p class="max-w-xl text-lg leading-relaxed text-atelier-muted">
                {{ pitch }}
            </p>
            <div class="mt-2 flex flex-wrap gap-3">
                <a
                    href="#extrait"
                    class="flex h-12 items-center gap-2.5 rounded-md bg-lilas px-5.5 text-[15px] font-semibold text-atelier-panel transition-colors duration-150 hover:bg-lilas-light"
                >
                    Lire un extrait gratuit
                    <ArrowRightIcon
                        class="size-4.5"
                        aria-hidden="true"
                    />
                </a>
                <a
                    v-if="canBuy"
                    href="#livre"
                    class="flex h-12 items-center rounded-md border border-atelier-line-strong px-5.5 text-[15px] font-medium text-atelier-ink transition-colors duration-150 hover:border-atelier-subtle hover:bg-atelier-hover"
                >
                    Acheter le livre<template v-if="minPrice"> · dès {{ minPrice }} €</template>
                </a>
            </div>
        </div>

        <div class="relative mx-auto w-full max-w-[460px] lg:col-span-5">
            <!-- page intérieure qui dépasse de la couverture -->
            <div
                class="absolute top-[6%] right-0 aspect-[148/210] w-[64%] rotate-[4deg] bg-page shadow-page"
                aria-hidden="true"
            >
                <div class="flex flex-col gap-[5%] px-[12%] pt-[30%]">
                    <span class="h-1.5 w-2/5 bg-page-ink/70"/>
                    <span class="h-[3px] w-3/4 rounded-full bg-page-ink/15"/>
                    <span class="h-[3px] w-1/2 rounded-full bg-page-ink/15"/>
                    <span class="h-[3px] w-2/3 rounded-full bg-page-ink/15"/>
                </div>
            </div>
            <div class="relative w-[70%]">
                <BookCover
                    :title="title"
                    :author="author"
                    :genre="genre"
                    :image-url="coverUrl"
                    :image-alt="coverAlt"
                />
            </div>
            <!-- repères de coupe -->
            <span
                class="absolute -top-4 -left-4 h-px w-3.5 bg-atelier-line-strong"
                aria-hidden="true"
            />
            <span
                class="absolute -top-7 -left-1 h-3.5 w-px bg-atelier-line-strong"
                aria-hidden="true"
            />
        </div>
    </header>
</template>

<script setup lang="ts">
import ArrowRightIcon from "@heroicons/vue/24/outline/ArrowRightIcon";
import BookCover from "~/components/landing/BookCover.vue";

defineProps<{
    title: string;
    author?: string;
    genre: string;
    pagesLabel: string;
    pitch: string;
    coverUrl?: string | null;
    coverAlt?: string | null;
    minPrice?: number;
    canBuy?: boolean;
}>();
</script>
