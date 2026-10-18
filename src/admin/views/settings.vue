<template>
    <AdminPage>
        <template #title>Configuration</template>
        <template #buttons>
            <BaseButton
                :loading="saving"
                @click="save"
            >
                Enregistrer
            </BaseButton>
        </template>

        <form
            aria-label="Configuration du site"
            class="flex max-w-4xl flex-col"
            @submit.prevent="save"
        >
            <section
                v-for="section in sections"
                :key="section.id"
                :aria-labelledby="`section-${section.id}`"
                class="grid grid-cols-1 gap-5 border-b border-atelier-line py-8 first:pt-0 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)]"
            >
                <div>
                    <h2
                        :id="`section-${section.id}`"
                        class="text-[15px] leading-snug font-semibold text-atelier-ink">{{ section.title }}</h2>
                    <p
                        v-if="section.hint"
                        class="mt-1 text-[13px] text-atelier-subtle">{{ section.hint }}</p>
                </div>

                <div
                    v-if="section.id === 'author'"
                    class="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                    <div class="flex items-center gap-4 sm:col-span-2">
                        <img
                            v-if="portrait"
                            :src="portrait.url"
                            alt="Photo de l'auteur"
                            class="h-20 w-16 shrink-0 rounded-[2px] object-cover shadow-page"
                        >
                        <span
                            v-else
                            class="flex h-20 w-16 shrink-0 items-center justify-center rounded-[2px] border border-dashed border-atelier-line-strong text-atelier-subtle"
                            aria-hidden="true"
                        >
                            <UserIcon class="size-6"/>
                        </span>
                        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span class="text-sm font-semibold text-atelier-ink">Photo de l'auteur</span>
                            <span class="truncate text-xs text-atelier-subtle">{{ portrait ? 'Affichée dans la section « L\'auteur »' : 'Image JPG ou PNG, cadrage vertical 4:5' }}</span>
                        </span>
                        <BaseButton
                            type="button"
                            @click="showPortraitDrawer = true"
                        >
                            {{ portrait ? 'Remplacer' : 'Ajouter' }}
                        </BaseButton>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="site-author-label"
                            :class="labelClass">Titre de la section</label>
                        <input
                            id="site-author-label"
                            v-model="form.author.label"
                            placeholder="L'auteur"
                            :class="fieldClass">
                    </div>
                    <div class="hidden sm:block"/>
                    <div class="flex flex-col gap-1.5 sm:col-span-2">
                        <label
                            for="site-author-bio"
                            :class="labelClass">Présentation</label>
                        <textarea
                            id="site-author-bio"
                            v-model="form.author.bio"
                            rows="6"
                            placeholder="Deux ou trois phrases : parcours, rapport à l'écriture, ce qui a mené à ce livre."
                            :class="areaClass"/>
                        <span :class="hintClass">Une ligne vide sépare les paragraphes. Le premier est mis en avant.</span>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="site-author-link-label"
                            :class="labelClass">Texte du lien</label>
                        <input
                            id="site-author-link-label"
                            v-model="form.author.linkLabel"
                            placeholder="Mon site, Instagram…"
                            :class="fieldClass">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="site-author-link-href"
                            :class="labelClass">Adresse du lien</label>
                        <input
                            id="site-author-link-href"
                            v-model="form.author.linkHref"
                            type="url"
                            placeholder="https://"
                            :class="fieldClass">
                    </div>
                </div>

                <div
                    v-else-if="section.id === 'hero'"
                    class="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="site-genre"
                            :class="labelClass">Genre</label>
                        <input
                            id="site-genre"
                            v-model="form.genre"
                            placeholder="Recueil"
                            :class="fieldClass">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="site-pages-label"
                            :class="labelClass">Sous-titre</label>
                        <input
                            id="site-pages-label"
                            v-model="form.pagesLabel"
                            placeholder="Poèmes et récits"
                            :class="fieldClass">
                    </div>
                    <div class="flex flex-col gap-1.5 sm:col-span-2">
                        <label
                            for="site-pitch"
                            :class="labelClass">Accroche</label>
                        <textarea
                            id="site-pitch"
                            v-model="form.pitch"
                            rows="3"
                            :class="areaClass"/>
                        <span :class="hintClass">Aussi utilisée comme description pour les moteurs de recherche.</span>
                    </div>
                </div>

                <div
                    v-else
                    class="flex flex-col gap-1.5"
                >
                    <label
                        for="site-footer"
                        :class="labelClass">Mention de copyright</label>
                    <input
                        id="site-footer"
                        v-model="form.footer"
                        :class="fieldClass">
                </div>
            </section>
        </form>

        <ImportImage
            :open="showPortraitDrawer"
            page-type="author_portrait"
            :image="portrait"
            @submit="savePortrait"
            @close="showPortraitDrawer = false"
        />
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {UserIcon} from "@heroicons/vue/24/outline";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import ImportImage from "~/components/admin/book/ImportImage.vue";
import type {AttachmentEntityInterface} from "~/entities/AttachmentEntity";
import type {FileEntityInterface} from "~/entities/FileEntity";
import {apiFetch} from "~/utils/api";
import {landingContent, type LandingContent} from "~/utils/landingContent";
import {toast} from "~/utils/toast";

function toForm(content: LandingContent) {
    return {
        genre: content.genre,
        pagesLabel: content.pagesLabel,
        pitch: content.pitch,
        author: {
            label: content.author.label,
            bio: content.author.bio.join('\n\n'),
            linkLabel: content.author.link?.label || '',
            linkHref: content.author.link?.href || '',
        },
        footer: content.footer,
    };
}

export default defineComponent({
    components: {AdminPage, BaseButton, ImportImage, UserIcon},
    data() {
        return {
            saving: false,
            showPortraitDrawer: false,
            portraitUrl: null as string | null,
            labelClass: 'text-[13px] text-atelier-muted',
            hintClass: 'text-[12px] text-atelier-subtle',
            fieldClass: 'h-11 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-3 text-[15px] text-atelier-ink placeholder:text-atelier-subtle focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none',
            areaClass: 'w-full resize-y rounded-md border border-atelier-line-strong bg-atelier-panel px-3 py-2.5 font-newsreader text-base leading-relaxed text-atelier-ink placeholder:text-atelier-subtle focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none',
            sections: [
                {id: 'author', title: 'Auteur', hint: 'Section « L\'auteur » de la page d\'accueil.'},
                {id: 'hero', title: 'En-tête', hint: 'Haut de la page d\'accueil, à côté de la couverture.'},
                {id: 'footer', title: 'Pied de page'},
            ],
            form: toForm(landingContent),
        };
    },
    computed: {
        portrait(): AttachmentEntityInterface | null {
            return this.portraitUrl
                ? {id: 'author-portrait', name: 'Photo de l\'auteur', size: 0, type: 'image', pageType: 'author_portrait', url: this.portraitUrl}
                : null;
        },
    },
    async mounted() {
        await this.fetchConfig();
    },
    methods: {
        async fetchConfig() {
            const data = await apiFetch<LandingContent>('/api/site-config');
            if (data) {
                this.form = toForm(data);
                this.portraitUrl = data.author.portraitUrl;
            }
        },
        toPayload() {
            const lines = (text: string, separator: RegExp) => text.split(separator).map(line => line.trim()).filter(Boolean);
            const {author} = this.form;
            return {
                genre: this.form.genre,
                pagesLabel: this.form.pagesLabel,
                pitch: this.form.pitch,
                author: {
                    label: author.label,
                    bio: lines(author.bio, /\n\s*\n/),
                    link: author.linkHref.trim() ? {label: author.linkLabel, href: author.linkHref} : null,
                },
                footer: this.form.footer,
            };
        },
        async save() {
            this.saving = true;
            try {
                const data = await apiFetch<LandingContent>('/api/site-config', {
                    method: 'PUT',
                    body: this.toPayload(),
                });
                this.form = toForm(data);
                this.portraitUrl = data.author.portraitUrl;
                toast.success('Configuration enregistrée avec succès');
            } catch {
                toast.error('Erreur lors de l\'enregistrement');
            } finally {
                this.saving = false;
            }
        },
        async savePortrait(files: FileEntityInterface[]) {
            const file = files[0]?.file as File | undefined;
            if (!file) {
                return;
            }
            const formData = new FormData();
            formData.append('file', file, file.name);
            try {
                const data = await apiFetch<LandingContent>('/api/site-portrait', {
                    method: 'POST',
                    body: formData,
                });
                this.portraitUrl = data.author.portraitUrl;
                this.showPortraitDrawer = false;
                toast.success('La photo a été enregistrée');
            } catch {
                toast.error('Erreur lors de l\'enregistrement de la photo');
            }
        },
    },
});
</script>
