<template>
    <footer class="border-t border-atelier-line">
        <div class="mx-auto flex max-w-7xl flex-col gap-6 px-5 pt-14 pb-16 sm:flex-row sm:items-end sm:px-8 lg:px-20">
            <div class="flex flex-col gap-2">
                <span class="font-fraunces text-[22px] text-atelier-ink italic">{{ title }}</span>
                <span class="text-sm text-atelier-subtle">Achevé de composer dans l'atelier.</span>
            </div>
            <span class="flex-1"/>
            <div class="flex flex-col gap-2 text-sm text-atelier-subtle sm:items-end">
                <nav
                    aria-label="Informations légales"
                    class="flex gap-5"
                >
                    <a
                        href="/mentions-legales"
                        class="hover:text-atelier-ink"
                    >Mentions légales</a>
                    <a
                        href="/confidentialite"
                        class="hover:text-atelier-ink"
                    >Politique de confidentialité</a>
                </nav>
                <p>{{ copyright }}</p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    copyright: string;
}>();
</script>
