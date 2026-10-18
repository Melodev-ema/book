<template>
    <FragmentContainer>
        <p
            v-if="loadError"
            class="p-8 text-center"
            role="alert"
            :data-book-error="loadError"
        >{{ loadError }}</p>
        <div
            v-else-if="loaded && bookStore.configLoaded"
            class="flex flex-col items-center w-full book"
            :class="[bookStore.bookCssClass, {excerpt: isExcerpt}]"
            :data-book-texts="posts.length">
            <CoverPage/>
            <BasePage>
                <!--            Page de faux-titre : Contient simplement le titre du recueil ou une citation évocatrice.-->
                <h1 class="title">{{ bookStore.config.title }}</h1>
                <h3 class="title">{{ bookStore.config.author }}</h3>
                <h4 class="title">{{ bookStore.config.years }}</h4>
                <p
                    v-if="isExcerpt"
                    class="title italic">— Extrait —</p>
            </BasePage>
            <BasePage v-if="bookStore.config.dedicationText">

                <!--            Dédicace : Une page où l'auteur peut dédier le recueil à une personne ou exprimer un hommage.-->
                <h2 class="title">Dédicace</h2>
                <p
                    v-for="(paragraph, i) in dedicationParagraphs"
                    :key="'ded-' + i"
                    class="text-left">{{ paragraph }}</p>

            </BasePage>
            <BasePage v-if="bookStore.config.prefaceText">

                <h2 class="title">Préface</h2>
                <p
                    v-for="(paragraph, i) in prefaceParagraphs"
                    :key="'pre-' + i"
                    class="text-left">{{ paragraph }}</p>

            </BasePage>
            <template v-if="tocPosition === 'start'">
                <TocPage
                    v-for="(lines, i) in tocPages"
                    :key="'toc-' + i"
                    :lines="lines"
                    :is-first="i === 0"
                    :page="firstTocPage + i"
                />
            </template>
            <template
                v-for="(page, i) in bodyPages"
                :key="'body-' + page.number">
                <PartPage
                    v-if="page.type === 'part'"
                    :numeral="page.numeral"
                    :title="page.title"
                />
                <PoemPage
                    v-else
                    :id="page.post.id"
                    :next-page-id="textPostId(bodyPages[i + 1])"
                    :prev-page-id="textPostId(bodyPages[i - 1])"
                    :title="page.post.postTitle"
                    :content="page.post.content"
                    :page="page.number"
                    :date="page.post.publishDate"
                    :author="page.post.author"
                    :show-signature="bookStore.config.showSignature"
                />
            </template>
            <template v-if="tocPosition === 'end'">
                <TocPage
                    v-for="(lines, i) in tocPages"
                    :key="'toc-' + i"
                    :lines="lines"
                    :is-first="i === 0"
                    :page="firstTocPage + i"
                />
            </template>
            <ExcerptEndPage
                v-if="isExcerpt"
                :remaining="excerptRemaining"/>
            <EndPage v-else/>
        </div>
    </FragmentContainer>
</template>

<script lang="ts">
import FragmentContainer from "~/components/layout/FragmentContainer.vue";
import CoverPage from "~/components/poems/bookPages/preliminaryPages/CoverPage.vue";
import PoemPage from "~/components/poems/bookPages/PoemPage.vue";
import BasePage from "~/components/poems/bookPages/BasePage.vue";
import EndPage from "~/components/poems/bookPages/concludingPages/EndPage.vue";
import ExcerptEndPage from "~/components/poems/bookPages/concludingPages/ExcerptEndPage.vue";
import TocPage from "~/components/poems/bookPages/TocPage.vue";
import PartPage from "~/components/poems/bookPages/PartPage.vue";
import {apiFetch} from "~/utils/api";
import type {PostInterface} from "~/server/models/post";
import PostEntity from "~/entities/PostEntity";
import {useBookStore} from "~/stores/bookStore";
import {EXCERPT_TEXT_COUNT, excerptPosts, layoutBook, type BodyPage, type BookPart, type TocLine, type TocPosition} from "~/utils/bookToc";
import {BOOK_TOKEN_HEADER} from "~/utils/bookAccess";

export default {
    components: {
        FragmentContainer,
        EndPage,
        ExcerptEndPage,
        TocPage,
        PartPage,
        PoemPage,
        BasePage,
        CoverPage,
    },
    props: {
        token: {type: String, default: ''},
        excerpt: {type: Boolean, default: false},
    },
    data() {
        const bookStore = useBookStore();
        bookStore.fetchImagePages();
        return {
            bookStore,
            posts: [] as PostEntity[],
            bodyPages: [] as BodyPage[],
            tocPages: [] as TocLine[][],
            firstTocPage: 0,
            loaded: false,
            // Affiché à la place du livre. Le générateur de PDF lit data-book-error et data-book-texts
            // pour refuser d'imprimer un livre en échec ou vide.
            loadError: '',
            totalPages: 0,
            // Textes du livre absents de l'extrait
            excerptRemaining: 0,
        };
    },
    computed: {
        // ?extrait=1 : seulement les premiers textes (PDF envoyé aux prospects)
        isExcerpt(): boolean {
            return this.excerpt;
        },
        tocPosition(): TocPosition {
            return this.bookStore.config.tocPosition;
        },
        dedicationParagraphs(): string[] {
            return (this.bookStore.config.dedicationText || '').split('\n').filter((p: string) => p.trim() !== '');
        },
        prefaceParagraphs(): string[] {
            return (this.bookStore.config.prefaceText || '').split('\n').filter((p: string) => p.trim() !== '');
        },
    },
    async mounted() {
        try {
            await this.bookStore.fetchConfig();
            this.applyDocumentSettings();
            await this.getPosts();
        } catch (error) {
            const status = (error as { status?: number })?.status;
            this.loadError = status === 401
                ? 'Accès refusé : connectez-vous, ou vérifiez le lien du livre.'
                : 'Impossible de charger le livre. Réessayez dans un instant.';
        }
    },
    methods: {
        // Applique au document : classe du body, taille @page et titre (repris par Chrome pour le PDF)
        applyDocumentSettings() {
            document.body.classList.add(this.bookStore.bookCssClass);
            document.body.dataset.theme = 'dark';
            const style = document.createElement('style');
            style.textContent = `@page { size: ${this.bookStore.pageSize}; margin: 0; }`;
            document.head.appendChild(style);
            const title = this.bookStore.config.title;
            document.title = this.isExcerpt ? `${title} — extrait` : title;
        },
        async getPosts() {
            // Tout le livre : sans « limit », l'API ne renvoie que les 10 derniers textes.
            // Sans session (génération du PDF), le jeton de l'URL ouvre la lecture des textes et des parties.
            const headers = this.token ? {[BOOK_TOKEN_HEADER]: this.token} : {};
            const [data, parts] = await Promise.all([
                apiFetch<{ rows: PostInterface[] }>('/api/post', {query: {limit: 'all'}, headers}),
                apiFetch<BookPart[]>('/api/part', {headers}),
            ]);
            const posts = data.rows.map((post: PostInterface) => PostEntity.hydrateFromDatabase(post));
            this.posts = this.isExcerpt ? excerptPosts(posts, parts, EXCERPT_TEXT_COUNT) : posts;
            this.excerptRemaining = posts.length - this.posts.length;
            const layout = layoutBook(this.posts, parts, this.bookStore.layoutOptions);
            this.bodyPages = layout.bodyPages;
            this.tocPages = layout.tocPages;
            this.firstTocPage = layout.firstTocPage;
            this.totalPages = layout.bodyPages.length;
            this.loaded = true;
        },
        // Id du texte d'une page voisine (undefined pour une page de partie ou hors du livre)
        textPostId(page: BodyPage | undefined) {
            return page?.type === 'text' ? page.post.id : undefined;
        },
    }
};

</script>

<style>
p {
    white-space: pre-line;
}
</style>
