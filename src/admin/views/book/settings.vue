<template>
    <AdminPage>
        <template #title>Mon livre</template>
        <template #buttons>
            <BaseButton
                :loading="saving"
                :disabled="!loaded"
                @click="save"
            >
                Enregistrer
            </BaseButton>
        </template>
        <template #actions>
            <AdminNavTabs :tabs="tabs"/>
        </template>

        <div class="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_300px]">
            <form
                aria-label="Configuration du livre"
                class="flex flex-col"
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
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <template v-if="section.id === 'meta'">
                            <div class="flex flex-col gap-1.5 sm:col-span-2">
                                <label
                                    for="cfg-title"
                                    :class="labelClass">Titre du recueil</label>
                                <input
                                    id="cfg-title"
                                    v-model="form.title"
                                    :class="[fieldClass, 'font-fraunces text-lg']">
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-author"
                                    :class="labelClass">Auteur</label>
                                <input
                                    id="cfg-author"
                                    v-model="form.author"
                                    :class="fieldClass">
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-years"
                                    :class="labelClass">Années</label>
                                <input
                                    id="cfg-years"
                                    v-model="form.years"
                                    placeholder="2019 - 2024"
                                    :class="[fieldClass, 'tabular-nums']">
                            </div>
                        </template>

                        <template v-else-if="section.id === 'texts'">
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-dedication"
                                    :class="labelClass">Texte de dédicace</label>
                                <textarea
                                    id="cfg-dedication"
                                    v-model="form.dedicationText"
                                    rows="3"
                                    :class="[areaClass, 'italic']"/>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-dedication-author"
                                    :class="labelClass">Auteur de la dédicace</label>
                                <input
                                    id="cfg-dedication-author"
                                    v-model="form.dedicationAuthor"
                                    :class="fieldClass">
                            </div>
                            <div class="flex flex-col gap-1.5 sm:col-span-2">
                                <label
                                    for="cfg-preface"
                                    :class="labelClass">Texte de préface</label>
                                <textarea
                                    id="cfg-preface"
                                    v-model="form.prefaceText"
                                    rows="6"
                                    :class="areaClass"/>
                            </div>
                        </template>

                        <template v-else-if="section.id === 'toc'">
                            <label
                                for="cfg-toc"
                                class="flex cursor-pointer items-start gap-3 sm:col-span-2"
                            >
                                <input
                                    id="cfg-toc"
                                    v-model="form.showToc"
                                    type="checkbox"
                                    class="mt-0.5 size-[18px] shrink-0 accent-lilas"
                                >
                                <span class="flex flex-col gap-0.5">
                                    <span class="text-sm text-atelier-ink">Ajouter un sommaire au livre</span>
                                    <span class="text-[13px] text-atelier-subtle">Ses parties apparaissent aussi sur la page d'accueil.</span>
                                </span>
                            </label>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-toc-position"
                                    :class="labelClass">Emplacement</label>
                                <div class="grid grid-cols-1">
                                    <select
                                        id="cfg-toc-position"
                                        v-model="form.tocPosition"
                                        :disabled="!form.showToc"
                                        :class="[fieldClass, 'col-start-1 row-start-1 appearance-none pr-9 disabled:cursor-not-allowed disabled:opacity-50']"
                                    >
                                        <option value="start">Au début du livre</option>
                                        <option value="end">À la fin du livre</option>
                                    </select>
                                    <ChevronUpDownIcon
                                        class="pointer-events-none col-start-1 row-start-1 mr-3 size-4 self-center justify-self-end text-atelier-subtle"
                                        aria-hidden="true"/>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-toc-landing-max"
                                    :class="labelClass">Parties sur l'accueil</label>
                                <input
                                    id="cfg-toc-landing-max"
                                    v-model.number="form.landingTocMaxParts"
                                    type="number"
                                    min="1"
                                    :disabled="!form.showToc"
                                    :class="[fieldClass, 'tabular-nums disabled:cursor-not-allowed disabled:opacity-50']">
                            </div>
                        </template>

                        <template v-else>
                            <div class="flex flex-col gap-1.5 sm:col-span-2">
                                <label
                                    for="cfg-format"
                                    :class="labelClass">Format de page</label>
                                <div class="grid grid-cols-1">
                                    <select
                                        id="cfg-format"
                                        v-model="form.pageFormat"
                                        :class="[fieldClass, 'col-start-1 row-start-1 appearance-none pr-9']"
                                    >
                                        <option
                                            v-for="format in pageFormats"
                                            :key="format.value"
                                            :value="format.value">{{ format.label }}</option>
                                    </select>
                                    <ChevronUpDownIcon
                                        class="pointer-events-none col-start-1 row-start-1 mr-3 size-4 self-center justify-self-end text-atelier-subtle"
                                        aria-hidden="true"/>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-max-lines"
                                    :class="labelClass">Lignes max par page</label>
                                <input
                                    id="cfg-max-lines"
                                    v-model.number="form.maxLines"
                                    type="number"
                                    min="1"
                                    :class="[fieldClass, 'tabular-nums']">
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-max-lines-first"
                                    :class="labelClass">Lignes max (première page du poème)</label>
                                <input
                                    id="cfg-max-lines-first"
                                    v-model.number="form.maxLinesFirstPage"
                                    type="number"
                                    min="1"
                                    :class="[fieldClass, 'tabular-nums']">
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    for="cfg-page-start"
                                    :class="labelClass">Numéro de page de départ</label>
                                <input
                                    id="cfg-page-start"
                                    v-model.number="form.pageStart"
                                    type="number"
                                    min="1"
                                    :class="[fieldClass, 'tabular-nums']">
                            </div>
                            <label
                                for="cfg-signature"
                                class="flex cursor-pointer items-start gap-3 self-end pb-2.5 sm:col-span-2"
                            >
                                <input
                                    id="cfg-signature"
                                    v-model="form.showSignature"
                                    type="checkbox"
                                    class="mt-0.5 size-[18px] shrink-0 accent-lilas"
                                >
                                <span class="flex flex-col gap-0.5">
                                    <span class="text-sm text-atelier-ink">Afficher l'auteur et la date sous chaque texte</span>
                                    <span class="text-[13px] text-atelier-subtle">À décocher pour un livre classique d'un seul auteur.</span>
                                </span>
                            </label>
                        </template>
                    </div>
                </section>
            </form>

            <aside
                aria-label="Aperçu du format"
                class="flex flex-col items-center gap-5 xl:sticky xl:top-10 xl:self-start"
            >
                <div
                    class="relative flex flex-col items-center bg-page px-[11%] pt-[12%] text-center font-newsreader text-page-ink shadow-page"
                    :style="previewStyle"
                >
                    <span class="text-[0.45rem] tracking-[0.22em] text-page-muted uppercase">{{ form.author }}</span>
                    <span class="mt-[30%] text-xl leading-tight">{{ form.title || 'Sans titre' }}</span>
                    <span
                        class="mt-3 h-px w-4 bg-page-ink"
                        aria-hidden="true"/>
                    <span class="mt-3 text-[0.6rem] text-page-muted tabular-nums">{{ form.years }}</span>
                </div>
                <dl class="grid w-full max-w-[240px] grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[13px]">
                    <dt class="text-atelier-subtle">Format</dt>
                    <dd class="text-atelier-ink tabular-nums">{{ formatSize }}</dd>
                    <dt class="text-atelier-subtle">Lignes max du format</dt>
                    <dd class="text-atelier-ink tabular-nums">{{ formatLimits.maxLines }}</dd>
                    <dt class="text-atelier-subtle">Caractères par ligne</dt>
                    <dd class="text-atelier-ink tabular-nums">~{{ formatLimits.maxCharsPerLine }}</dd>
                </dl>
                <p
                    v-if="form.maxLines > formatLimits.maxLines"
                    class="max-w-[240px] rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning"
                >
                    Au-delà de {{ formatLimits.maxLines }} lignes, ce format limite automatiquement la page.
                </p>
            </aside>
        </div>
    </AdminPage>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ChevronUpDownIcon} from "@heroicons/vue/24/outline";
import AdminNavTabs from "~/components/admin/ui/AdminNavTabs.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import {PAGE_FORMAT_LIMITS, PAGE_FORMAT_SIZES, type BookConfigState} from "~/stores/bookStore";
import {apiFetch, apiTry} from "~/utils/api";
import {landingTocLimit} from "~/utils/bookToc";
import {toast} from "~/utils/toast";

export default defineComponent({
    components: {AdminPage, AdminNavTabs, BaseButton, ChevronUpDownIcon},
    data() {
        return {
            saving: false,
            // Tant que la config n'est pas chargée, l'enregistrer écraserait la vraie par les valeurs par défaut
            loaded: false,
            labelClass: 'text-[13px] text-atelier-muted',
            fieldClass: 'h-11 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-3 text-[15px] text-atelier-ink placeholder:text-atelier-subtle focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none',
            areaClass: 'w-full resize-y rounded-md border border-atelier-line-strong bg-atelier-panel px-3 py-2.5 font-newsreader text-base leading-relaxed text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none',
            sections: [
                {id: 'meta', title: 'Métadonnées', hint: 'Page de titre et couverture.'},
                {id: 'texts', title: 'Dédicace et préface', hint: 'Pages liminaires, avant le premier texte.'},
                {id: 'toc', title: 'Sommaire', hint: 'Les parties et leur numéro de page (les textes, si le livre n\'a pas de partie).'},
                {id: 'layout', title: 'Format et mise en page', hint: 'Appliqué à l\'aperçu et au PDF.'},
            ],
            tabs: [
                {name: 'Mon livre', route: '/book', current: false},
                {name: 'Parties', route: '/book/parts', current: false},
                {name: 'Configuration', route: '/book/settings', current: true},
            ],
            form: {
                title: '',
                author: '',
                years: '',
                dedicationText: '',
                dedicationAuthor: '',
                prefaceText: '',
                pageFormat: 'a4',
                maxLines: 38,
                maxLinesFirstPage: 32,
                pageStart: 6,
                showSignature: true,
                showToc: false,
                tocPosition: 'start',
                landingTocMaxParts: 6,
            },
            pageFormats: [
                {label: 'Poche (108 × 175 mm)', value: 'poche'},
                {label: 'Digest (140 × 216 mm)', value: 'digest'},
                {label: 'A5 (148 × 210 mm)', value: 'a5'},
                {label: 'Royal (156 × 234 mm)', value: 'royal'},
                {label: 'Roman (152 × 229 mm)', value: 'roman'},
                {label: 'BD (168 × 260 mm)', value: 'bd'},
                {label: 'Exécutif (178 × 254 mm)', value: 'executif'},
                {label: 'Crown Quarto (189 × 246 mm)', value: 'crown-quarto'},
                {label: 'Petit Carré (191 × 191 mm)', value: 'petit-carre'},
                {label: 'A4 (210 × 297 mm)', value: 'a4'},
                {label: 'Carré (216 × 216 mm)', value: 'carre'},
                {label: 'Lettre US (216 × 279 mm)', value: 'lettre-us'},
                {label: 'Petit Paysage (229 × 178 mm)', value: 'petit-paysage'},
                {label: 'Lettre US Paysage (279 × 216 mm)', value: 'lettre-us-paysage'},
                {label: 'A4 Paysage (297 × 210 mm)', value: 'a4-paysage'},
                {label: 'Calendrier (279 × 216 mm)', value: 'calendrier'},
            ],
        };
    },
    computed: {
        formatSize(): string {
            const size = PAGE_FORMAT_SIZES[this.form.pageFormat] || PAGE_FORMAT_SIZES.a4;
            return size.replace(/mm/g, '').trim().split(/\s+/).join(' × ') + ' mm';
        },
        formatLimits() {
            return PAGE_FORMAT_LIMITS[this.form.pageFormat] || PAGE_FORMAT_LIMITS.a4;
        },
        previewStyle(): Record<string, string> {
            const [width, height] = (PAGE_FORMAT_SIZES[this.form.pageFormat] || PAGE_FORMAT_SIZES.a4)
                .split(/\s+/)
                .map(value => parseFloat(value));
            const scale = Math.min(220 / width, 300 / height);
            return {width: `${Math.round(width * scale)}px`, height: `${Math.round(height * scale)}px`};
        },
    },
    async mounted() {
        await this.fetchConfig();
    },
    methods: {
        async fetchConfig() {
            const {data, error} = await apiTry<BookConfigState>('/api/book-config');
            if (error) {
                toast.error('Impossible de charger la configuration : rechargez la page avant de la modifier');
                return;
            }
            this.loaded = true;
            if (data) {
                this.form.title = data.title || '';
                this.form.author = data.author || '';
                this.form.years = data.years || '';
                this.form.dedicationText = data.dedicationText || '';
                this.form.dedicationAuthor = data.dedicationAuthor || '';
                this.form.prefaceText = data.prefaceText || '';
                this.form.pageFormat = data.pageFormat || 'a4';
                this.form.maxLines = data.maxLines || 38;
                this.form.maxLinesFirstPage = data.maxLinesFirstPage || 32;
                this.form.pageStart = data.pageStart || 6;
                this.form.showSignature = data.showSignature ?? true;
                this.form.showToc = data.showToc ?? false;
                this.form.tocPosition = data.tocPosition === 'end' ? 'end' : 'start';
                this.form.landingTocMaxParts = landingTocLimit(data.landingTocMaxParts);
            }
        },
        async save() {
            if (!this.loaded || this.saving) {
                return;
            }
            this.saving = true;
            // Champ vidé ou à 0 : le formulaire affiche la valeur réellement enregistrée
            this.form.landingTocMaxParts = landingTocLimit(this.form.landingTocMaxParts);
            try {
                await apiFetch('/api/book-config', {
                    method: 'PUT',
                    body: this.form,
                });
                toast.success('Configuration enregistrée avec succès');
            } catch {
                toast.error('Erreur lors de l\'enregistrement');
            } finally {
                this.saving = false;
            }
        },
    },
});
</script>
