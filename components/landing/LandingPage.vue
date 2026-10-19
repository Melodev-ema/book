<template>
    <div class="min-h-screen bg-atelier-ground font-instrument text-atelier-ink antialiased [scroll-behavior:smooth] motion-reduce:[scroll-behavior:auto]">
        <LandingNav
            :title="bookTitle"
            :sections="sections"
            :can-buy="hasOffers"
            current-path="/"
        />
        <main>
            <LandingHero
                :title="bookTitle"
                :author="bookAuthor"
                :genre="content.genre"
                :pages-label="content.pagesLabel"
                :pitch="content.pitch"
                :cover-url="coverImage?.url"
                :cover-alt="coverImage?.name"
                :min-price="minPrice"
                :can-buy="hasOffers"
            />
            <LandingTestimonial
                v-if="content.testimonial"
                :testimonial="content.testimonial"
            />
            <TableOfContents
                v-if="tocParts.length"
                :number="sectionNumber('sommaire')"
                :heading="content.toc.heading"
                :heading-emphasis="content.toc.headingEmphasis"
                :intro="content.toc.intro"
                :parts="tocParts"
                :hidden-count="tocHiddenCount"
            />
            <LandingFreeSample
                :number="sectionNumber('extrait')"
                :heading="content.freeSample.heading"
                :heading-emphasis="content.freeSample.headingEmphasis"
                :intro="content.freeSample.intro"
                :note="content.freeSample.note"
                :author="bookAuthor"
            />
            <Author
                :number="sectionNumber('auteur')"
                :label="content.author.label"
                :name="bookAuthor || content.author.label"
                :bio="content.author.bio"
                :portrait-url="content.author.portraitUrl"
                :link="content.author.link"
            />
            <BookPricing
                v-if="hasOffers"
                :number="sectionNumber('livre')"
                :heading="content.pricing.heading"
                :heading-emphasis="content.pricing.headingEmphasis"
                :intro="content.pricing.intro"
                :offers="content.pricing.offers"
            />
        </main>
        <LandingFooter
            :title="bookTitle"
            :copyright="content.footer"
        />
    </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useBookStore} from "~/stores/bookStore";
import type {LandingData} from "~/server/services/landingData";
import {landingContent, type LandingContent, type LandingTocPart} from "~/utils/landingContent";
import LandingNav from "~/components/landing/LandingNav.vue";
import LandingHero from "~/components/landing/LandingHero.vue";
import LandingTestimonial from "~/components/landing/LandingTestimonial.vue";
import TableOfContents from "~/components/landing/TableOfContents.vue";
import LandingFreeSample from "~/components/landing/LandingFreeSample.vue";
import Author from "~/components/landing/Author.vue";
import BookPricing from "~/components/landing/BookPricing.vue";
import LandingFooter from "~/components/landing/LandingFooter.vue";

const props = defineProps<{data: LandingData}>();

// Avant tout rendu, sur le serveur comme dans le navigateur
const bookStore = useBookStore();
bookStore.hydrate({config: props.data.bookConfig, imagePages: props.data.imagePages});

const content = computed<LandingContent>(() => props.data.siteConfig ?? landingContent);

// Sommaire : les premières parties du livre (titres et numéros) et le nombre des autres, calculés par le serveur
// Sans partie, la section est masquée
const tocParts = computed<LandingTocPart[]>(() => props.data.toc?.parts ?? []);
const tocHiddenCount = computed(() => props.data.toc?.hiddenCount ?? 0);

const bookTitle = computed(() => bookStore.config.title || 'Le livre');
const bookAuthor = computed(() => bookStore.config.author || '');
const coverImage = computed(() => bookStore.getImagePageByType('cover'));
// Offres sans lien d'achat configuré : déjà retirées par le serveur (purchasableOffers)
const hasOffers = computed(() => content.value.pricing.offers.length > 0);
const minPrice = computed(() => hasOffers.value ? Math.min(...content.value.pricing.offers.map(offer => offer.price)) : undefined);

const sections = computed(() => [
    ...(tocParts.value.length ? [{id: 'sommaire', label: 'Sommaire'}] : []),
    {id: 'extrait', label: 'Extrait gratuit'},
    {id: 'auteur', label: content.value.author.label},
    ...(hasOffers.value ? [{id: 'livre', label: 'Obtenir le livre'}] : []),
]);

// Numéros « 01 », « 02 »… : ils suivent les sections affichées (le sommaire peut être masqué)
const sectionNumber = (id: string) =>
    String(sections.value.findIndex(section => section.id === id) + 1).padStart(2, '0');
</script>
