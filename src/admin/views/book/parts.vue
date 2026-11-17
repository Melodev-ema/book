<template>
    <AdminPage>
        <template #title>Mon livre</template>
        <template #actions>
            <AdminNavTabs :tabs="tabs"/>
        </template>

        <section
            aria-labelledby="section-parts"
            class="grid grid-cols-1 gap-5 md:grid-cols-[180px_minmax(0,1fr)]"
        >
            <div>
                <h2
                    id="section-parts"
                    class="text-[15px] leading-snug font-semibold text-atelier-ink">Parties</h2>
                <p class="mt-1 text-[13px] text-atelier-subtle">
                    Facultatives. Chaque partie ouvre sur une page à son titre, et le sommaire du livre ne liste que les parties.
                </p>
                <p
                    v-if="parts.length"
                    class="mt-3 text-[13px] text-atelier-subtle">
                    Glissez un texte pour le changer de partie ou de place, ou utilisez les flèches et la liste à droite de son titre.
                </p>
            </div>

            <div class="flex flex-col gap-4">
                <p
                    v-if="loaded && !posts.length"
                    class="text-sm text-atelier-muted">
                    Le livre est encore vide : ajoutez ou importez des textes.
                </p>

                <div
                    v-if="sections.length > 1"
                    class="-mb-1 flex justify-end"
                >
                    <button
                        type="button"
                        class="rounded-md px-2 py-1 text-[13px] text-atelier-muted transition-colors duration-150 hover:bg-atelier-hover hover:text-atelier-ink focus-visible:outline-2 focus-visible:outline-lilas"
                        @click="setAllCollapsed(!allCollapsed)"
                    >
                        {{ allCollapsed ? 'Tout déplier' : 'Tout replier' }}
                    </button>
                </div>

                <div
                    v-for="section in sections"
                    :key="section.part?.id ?? 'loose'"
                    class="rounded-md border transition-colors duration-150"
                    :class="dropTarget?.key === sectionKey(section.part) ? 'border-lilas bg-lilas-soft/40' : 'border-atelier-line'"
                    @dragover.prevent="onDragOverSection(section)"
                    @dragleave="onDragLeave($event, section.part)"
                    @drop.prevent="onDrop(section.part)"
                >
                    <div
                        v-if="section.part"
                        class="flex flex-wrap items-center gap-3 px-3 py-2.5 sm:flex-nowrap"
                        :class="collapsed(section) ? '' : 'border-b border-atelier-line'"
                    >
                        <button
                            type="button"
                            :class="[iconButtonClass, '-mr-2']"
                            :aria-expanded="!collapsed(section)"
                            :aria-controls="`part-posts-${sectionKey(section.part)}`"
                            :aria-label="`${collapsed(section) ? 'Déplier' : 'Replier'} « ${section.part.title} »`"
                            @click="toggle(section)"
                        >
                            <ChevronRightIcon
                                class="size-4 transition-transform duration-200 motion-reduce:transition-none"
                                :class="collapsed(section) ? '' : 'rotate-90'"
                                aria-hidden="true"/>
                        </button>
                        <span
                            class="w-9 shrink-0 font-fraunces text-[15px] text-menthe"
                            :aria-label="numerals[section.part.id] ? `Partie ${numerals[section.part.id]}` : 'Partie vide'"
                        >{{ numerals[section.part.id] || '—' }}</span>
                        <label
                            :for="`part-title-${section.part.id}`"
                            class="sr-only">Titre de la partie</label>
                        <input
                            :id="`part-title-${section.part.id}`"
                            v-model="titles[section.part.id]"
                            :class="[fieldClass, 'min-w-0 flex-1 font-fraunces italic']"
                            @keydown.enter.prevent="rename(section.part)"
                            @blur="rename(section.part)"
                        >
                        <span
                            class="shrink-0 text-[13px] tabular-nums transition-colors duration-300"
                            :class="flashKey === sectionKey(section.part) ? 'text-lilas' : 'text-atelier-subtle'"
                        >{{ countLabel(section.posts.length) }}</span>
                        <span class="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                :class="iconButtonClass"
                                :disabled="section.index === 0"
                                :aria-label="`Monter « ${section.part.title} »`"
                                @click="move(section.index, -1)"
                            >
                                <ArrowUpIcon
                                    class="size-4"
                                    aria-hidden="true"/>
                            </button>
                            <button
                                type="button"
                                :class="iconButtonClass"
                                :disabled="section.index === parts.length - 1"
                                :aria-label="`Descendre « ${section.part.title} »`"
                                @click="move(section.index, 1)"
                            >
                                <ArrowDownIcon
                                    class="size-4"
                                    aria-hidden="true"/>
                            </button>
                            <button
                                type="button"
                                :class="[iconButtonClass, 'hover:text-danger']"
                                :aria-label="`Supprimer « ${section.part.title} »`"
                                @click="confirmRemove(section.part)"
                            >
                                <TrashIcon
                                    class="size-4"
                                    aria-hidden="true"/>
                            </button>
                        </span>
                    </div>
                    <div
                        v-else
                        class="flex items-center gap-3 px-3 py-2.5"
                        :class="collapsed(section) ? '' : 'border-b border-atelier-line'"
                    >
                        <button
                            type="button"
                            :class="[iconButtonClass, '-mr-2']"
                            :aria-expanded="!collapsed(section)"
                            aria-controls="part-posts-loose"
                            :aria-label="collapsed(section) ? 'Déplier les textes hors partie' : 'Replier les textes hors partie'"
                            @click="toggle(section)"
                        >
                            <ChevronRightIcon
                                class="size-4 transition-transform duration-200 motion-reduce:transition-none"
                                :class="collapsed(section) ? '' : 'rotate-90'"
                                aria-hidden="true"/>
                        </button>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-[13px] font-semibold text-atelier-ink">Hors partie</h3>
                            <p class="text-[13px] text-atelier-subtle">Au début du livre, avant la première partie. Absents du sommaire.</p>
                        </div>
                        <span
                            class="shrink-0 text-[13px] tabular-nums transition-colors duration-300"
                            :class="flashKey === 'loose' ? 'text-lilas' : 'text-atelier-subtle'"
                        >{{ countLabel(section.posts.length) }}</span>
                    </div>

                    <!-- Repliée : la liste reste dans la page (pour l'animation) mais sort du parcours clavier -->
                    <div
                        :id="`part-posts-${sectionKey(section.part)}`"
                        class="grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none"
                        :class="collapsed(section) ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
                        :inert="collapsed(section)"
                    >
                        <div class="min-h-0 overflow-hidden">
                            <ul
                                v-if="section.posts.length"
                                class="flex flex-col divide-y divide-atelier-line"
                            >
                                <li
                                    v-for="(post, postIndex) in section.posts"
                                    :key="post.id ?? post.postTitle"
                                    draggable="true"
                                    class="group flex cursor-grab items-center gap-2 px-3 py-1.5 active:cursor-grabbing"
                                    :class="[
                                        draggedId === post.id ? 'opacity-40' : '',
                                        isDropBefore(section.part, postIndex) ? 'shadow-[inset_0_2px_0_var(--color-lilas)]' : '',
                                        postIndex === section.posts.length - 1 && isDropBefore(section.part, postIndex + 1) ? 'shadow-[inset_0_-2px_0_var(--color-lilas)]' : '',
                                    ]"
                                    @dragstart="onDragStart($event, post)"
                                    @dragend="onDragEnd"
                                    @dragover.prevent.stop="onDragOverPost($event, section.part, postIndex)"
                                >
                                    <Bars2Icon
                                        class="size-4 shrink-0 text-atelier-subtle group-hover:text-atelier-muted"
                                        aria-hidden="true"/>
                                    <label
                                        :for="`post-part-${post.id}`"
                                        class="min-w-0 flex-1 truncate font-newsreader text-[17px] text-atelier-ink"
                                    >{{ post.postTitle }}</label>
                                    <span class="flex shrink-0 items-center opacity-100 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0">
                                        <button
                                            type="button"
                                            :class="iconButtonClass"
                                            :disabled="postIndex === 0"
                                            :aria-label="`Monter « ${post.postTitle} »`"
                                            @click="shift(post, section.part, postIndex, -1)"
                                        >
                                            <ArrowUpIcon
                                                class="size-3.5"
                                                aria-hidden="true"/>
                                        </button>
                                        <button
                                            type="button"
                                            :class="iconButtonClass"
                                            :disabled="postIndex === section.posts.length - 1"
                                            :aria-label="`Descendre « ${post.postTitle} »`"
                                            @click="shift(post, section.part, postIndex, 1)"
                                        >
                                            <ArrowDownIcon
                                                class="size-3.5"
                                                aria-hidden="true"/>
                                        </button>
                                    </span>
                                    <div
                                        v-if="parts.length"
                                        class="grid shrink-0 grid-cols-1"
                                    >
                                        <select
                                            :id="`post-part-${post.id}`"
                                            :value="post.partId ?? ''"
                                            class="col-start-1 row-start-1 h-8 max-w-40 appearance-none truncate rounded-md border border-transparent bg-transparent pr-7 pl-2 text-[13px] text-atelier-muted hover:border-atelier-line-strong focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                                            @change="assign(post, ($event.target as HTMLSelectElement).value)"
                                        >
                                            <option value="">Hors partie</option>
                                            <option
                                                v-for="part in parts"
                                                :key="part.id"
                                                :value="part.id">{{ numerals[part.id] ? `${numerals[part.id]} — ` : '' }}{{ part.title }}</option>
                                        </select>
                                        <ChevronUpDownIcon
                                            class="pointer-events-none col-start-1 row-start-1 mr-2 size-3.5 self-center justify-self-end text-atelier-subtle"
                                            aria-hidden="true"/>
                                    </div>
                                </li>
                            </ul>
                            <p
                                v-else
                                class="px-3 py-4 text-center text-[13px] text-atelier-subtle"
                            >
                                {{ section.part ? 'Partie vide, absente du livre : glissez des textes ici.' : 'Glissez ici un texte à placer avant la première partie.' }}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    class="flex flex-col gap-2 sm:flex-row"
                    @submit.prevent="create"
                >
                    <label
                        for="part-new"
                        class="sr-only">Titre de la nouvelle partie</label>
                    <input
                        id="part-new"
                        v-model="newTitle"
                        placeholder="Titre de la nouvelle partie"
                        :class="[fieldClass, 'flex-1']"
                    >
                    <BaseButton
                        :loading="creating"
                        @click="create"
                    >
                        <PlusIcon
                            class="mr-2 -ml-1 size-4"
                            aria-hidden="true"/>
                        Ajouter la partie
                    </BaseButton>
                </form>
            </div>
        </section>
    </AdminPage>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {ArrowDownIcon, ArrowUpIcon, Bars2Icon, ChevronRightIcon, ChevronUpDownIcon, PlusIcon, TrashIcon} from "@heroicons/vue/24/outline";
import AdminNavTabs from "~/components/admin/ui/AdminNavTabs.vue";
import AdminPage from "~/components/admin/ui/AdminPage.vue";
import BaseButton from "~/components/ui/buttons/BaseButton.vue";
import PostEntity from "~/entities/PostEntity";
import type {PostInterface} from "~/server/models/post";
import type {PartInterface} from "~/server/models/part";
import {groupByPart, sortByPosition} from "~/utils/bookToc";
import {apiFetch} from "~/utils/api";
import {isCollapsed} from "~/utils/partsCollapse";
import {toast} from "~/utils/toast";

const tabs = [
    {name: 'Mon livre', route: '/book', current: false},
    {name: 'Parties', route: '/book/parts', current: true},
    {name: 'Configuration', route: '/book/settings', current: false},
];

const fieldClass = 'h-11 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-3 text-[15px] text-atelier-ink placeholder:text-atelier-subtle focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none';
const iconButtonClass = 'inline-flex size-9 items-center justify-center rounded-md text-atelier-muted transition-colors duration-150 hover:bg-atelier-hover hover:text-atelier-ink focus-visible:outline-2 focus-visible:outline-lilas disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

const parts = ref<PartInterface[]>([]);
const posts = ref<PostEntity[]>([]);
// Titres en cours d'édition, par id de partie
const titles = ref<Record<number, string>>({});
const newTitle = ref('');
const creating = ref(false);
const loaded = ref(false);

const countByPart = computed(() => {
    const counts: Record<number, number> = {};
    for (const post of posts.value) {
        if (post.partId) {
            counts[post.partId] = (counts[post.partId] ?? 0) + 1;
        }
    }
    return counts;
});

// Même numérotation que le livre : une partie vide n'est pas numérotée
const numerals = computed(() => {
    const result: Record<number, string> = {};
    for (const section of groupByPart(posts.value, parts.value)) {
        if (section.part) {
            result[section.part.id] = section.numeral;
        }
    }
    return result;
});

// Le livre dans l'ordre : les textes hors partie (dès qu'il y a des parties ou des textes à ranger),
// puis chaque partie avec ses textes, y compris les parties vides
const sections = computed(() => {
    const knownIds = new Set(parts.value.map(part => part.id));
    const ordered = sortByPosition(posts.value);
    const loose = ordered.filter(post => !post.partId || !knownIds.has(post.partId));
    return [
        ...(loose.length || parts.value.length ? [{part: null, index: -1, posts: loose}] : []),
        ...parts.value.map((part, index) => ({part, index, posts: ordered.filter(post => post.partId === part.id)})),
    ];
});

type Section = (typeof sections.value)[number];

const countLabel = (count: number) => count ? `${count} texte${count > 1 ? 's' : ''}` : 'vide';

// Parties repliées ou dépliées. Le choix de chacune est retenu dans ce navigateur ; sans choix,
// une grosse partie est repliée. L'état est figé dès l'affichage, pour qu'une partie qui grossit
// ne se replie pas toute seule.
const COLLAPSED_STORAGE_KEY = 'admin-parts-collapsed';
const collapsedState = ref<Record<string, boolean>>({});

const readSavedCollapsed = (): Record<string, boolean> => {
    try {
        return JSON.parse(localStorage.getItem(COLLAPSED_STORAGE_KEY) ?? '{}') ?? {};
    } catch {
        return {};
    }
};

const saveCollapsed = () => {
    try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(collapsedState.value));
    } catch {
        // Stockage indisponible (navigation privée…) : l'état ne vaut que pour cette visite
    }
};

const collapsed = (section: Section) =>
    isCollapsed(sectionKey(section.part), section.posts.length, collapsedState.value);

// Fige l'état par défaut des parties qui n'en ont pas encore
const settleCollapsed = () => {
    const saved = readSavedCollapsed();
    for (const section of sections.value) {
        const key = sectionKey(section.part);
        collapsedState.value[key] ??= isCollapsed(key, section.posts.length, saved);
    }
};

const setCollapsed = (key: string, value: boolean) => {
    collapsedState.value[key] = value;
    saveCollapsed();
};

const toggle = (section: Section) => setCollapsed(sectionKey(section.part), !collapsed(section));

const allCollapsed = computed(() => sections.value.every(section => collapsed(section)));

const setAllCollapsed = (value: boolean) => {
    for (const section of sections.value) {
        collapsedState.value[sectionKey(section.part)] = value;
    }
    saveCollapsed();
};

// Après un dépôt dans une partie repliée, son compteur s'éclaire un instant
const flashKey = ref<string | null>(null);
let flashTimer: ReturnType<typeof setTimeout> | undefined;
const flash = (key: string) => {
    clearTimeout(flashTimer);
    flashKey.value = key;
    flashTimer = setTimeout(() => {
        flashKey.value = null;
    }, 1200);
};

// Glisser-déposer d'un texte : vers une autre partie (ou hors partie), ou à une autre place de sa partie
const draggedId = ref<number | null>(null);
// Zone survolée et place où le texte serait inséré (index dans les textes de la zone)
const dropTarget = ref<{ key: string; index: number } | null>(null);
const sectionKey = (part: PartInterface | null) => part ? String(part.id) : 'loose';
const isDropBefore = (part: PartInterface | null, index: number) =>
    dropTarget.value?.key === sectionKey(part) && dropTarget.value.index === index;

const onDragStart = (event: DragEvent, post: PostEntity) => {
    draggedId.value = post.id;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', post.postTitle);
    }
};

const onDragEnd = () => {
    cancelSpring();
    draggedId.value = null;
    dropTarget.value = null;
};

// Au-dessus d'un texte : insertion avant ou après lui, selon la moitié survolée
const onDragOverPost = (event: DragEvent, part: PartInterface | null, index: number) => {
    if (draggedId.value === null) {
        return;
    }
    // Mesuré sur la ligne entière : offsetY dépendrait de l'élément survolé (titre, flèches, liste)
    const row = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const after = event.clientY > row.top + row.height / 2;
    dropTarget.value = {key: sectionKey(part), index: after ? index + 1 : index};
};

// Ailleurs dans la zone (titre de la partie, zone vide) : en fin de partie
// Une partie repliée s'ouvre si l'on garde le texte au-dessus d'elle un instant
const SPRING_DELAY = 600;
let springTimer: ReturnType<typeof setTimeout> | undefined;
const cancelSpring = () => {
    clearTimeout(springTimer);
    springTimer = undefined;
};

const onDragOverSection = (section: Section) => {
    const key = sectionKey(section.part);
    if (draggedId.value === null || dropTarget.value?.key === key) {
        return;
    }
    dropTarget.value = {key, index: section.posts.length};
    cancelSpring();
    if (collapsed(section)) {
        springTimer = setTimeout(() => {
            if (draggedId.value !== null && dropTarget.value?.key === key) {
                setCollapsed(key, false);
            }
        }, SPRING_DELAY);
    }
};

const onDragLeave = (event: DragEvent, part: PartInterface | null) => {
    // Ignore le passage d'un enfant à l'autre à l'intérieur de la même zone
    const zone = event.currentTarget as HTMLElement;
    if (!zone.contains(event.relatedTarget as Node | null) && dropTarget.value?.key === sectionKey(part)) {
        cancelSpring();
        dropTarget.value = null;
    }
};

const onDrop = (part: PartInterface | null) => {
    const post = posts.value.find(item => item.id === draggedId.value);
    const index = dropTarget.value?.key === sectionKey(part) ? dropTarget.value.index : Infinity;
    onDragEnd();
    if (post) {
        place(post, part, index);
    }
};

const setParts = (list: PartInterface[]) => {
    parts.value = list;
    titles.value = Object.fromEntries(list.map(part => [part.id, part.title]));
};

const notifyError = (title: string) => toast.error(title, {id: 'parts-error'});

const load = async () => {
    const [partList, data] = await Promise.all([
        apiFetch<PartInterface[]>('/api/part'),
        apiFetch<{ rows: PostInterface[] }>('/api/post', {query: {limit: 'all'}}),
    ]);
    setParts(partList);
    posts.value = data.rows.map(post => PostEntity.hydrateFromDatabase(post));
    settleCollapsed();
    loaded.value = true;
};

const create = async () => {
    const title = newTitle.value.trim();
    if (!title || creating.value) {
        return;
    }
    creating.value = true;
    try {
        const part = await apiFetch<PartInterface>('/api/part', {method: 'POST', body: {title}});
        setParts([...parts.value, part]);
        settleCollapsed();
        newTitle.value = '';
    } catch {
        notifyError('Erreur lors de la création de la partie');
    } finally {
        creating.value = false;
    }
};

const rename = async (part: PartInterface) => {
    const title = (titles.value[part.id] ?? '').trim();
    if (title === part.title) {
        return;
    }
    if (!title) {
        titles.value[part.id] = part.title;
        return;
    }
    try {
        await apiFetch(`/api/part/${part.id}`, {method: 'PUT', body: {title}});
        part.title = title;
        toast.success('Partie renommée', {id: 'part-renamed'});
    } catch {
        titles.value[part.id] = part.title;
        notifyError('Erreur lors du renommage de la partie');
    }
};

const move = async (index: number, offset: number) => {
    const reordered = [...parts.value];
    const [moved] = reordered.splice(index, 1);
    if (!moved) {
        return;
    }
    reordered.splice(index + offset, 0, moved);
    const previous = parts.value;
    parts.value = reordered;
    try {
        setParts(await apiFetch<PartInterface[]>('/api/part/order', {method: 'PUT', body: {ids: reordered.map(part => part.id)}}));
    } catch {
        parts.value = previous;
        notifyError('Erreur lors du déplacement de la partie');
    }
};

const remove = async (part: PartInterface) => {
    try {
        await apiFetch(`/api/part/${part.id}`, {method: 'DELETE'});
    } catch {
        notifyError('Erreur lors de la suppression de la partie');
        return;
    }
    setParts(parts.value.filter(item => item.id !== part.id));
    for (const post of posts.value) {
        if (post.partId === part.id) {
            post.partId = null;
        }
    }
    toast.success('Partie supprimée', {id: 'part-deleted'});
};

const confirmRemove = (part: PartInterface) => {
    const count = countByPart.value[part.id] ?? 0;
    toast.error('Supprimer la partie ?', {
        id: 'part-delete',
        description: count
            ? `« ${part.title} » sera supprimée. Ses ${count} texte${count > 1 ? 's' : ''} resteront dans le livre, sans partie.`
            : `« ${part.title} » sera supprimée.`,
        duration: Infinity,
        action: {label: 'Supprimer', onClick: () => remove(part)},
        cancel: {label: 'Annuler', onClick: () => {}},
    });
};

// Place un texte dans une partie (null = hors partie), avant le texte d'index « index » de cette partie
// (index compté avant de retirer le texte, comme l'indique le glisser-déposer). Toute la partie est renumérotée.
const place = async (post: PostEntity, part: PartInterface | null, index: number) => {
    const section = sections.value.find(item => item.part?.id === part?.id);
    const current = section?.posts ?? [];
    const from = current.indexOf(post);
    const target = from !== -1 && from < index ? index - 1 : index;
    const ordered = current.filter(item => item !== post);
    ordered.splice(Math.min(target, ordered.length), 0, post);
    if (from === target && post.partId === (part?.id ?? null)) {
        return;
    }

    if (section && collapsed(section)) {
        flash(sectionKey(part));
    }

    const previous = posts.value.map(item => ({item, partId: item.partId, position: item.position}));
    post.partId = part?.id ?? null;
    ordered.forEach((item, position) => {
        item.position = position;
    });
    try {
        await apiFetch('/api/post/order', {method: 'PUT', body: {partId: post.partId, ids: ordered.map(item => item.id)}});
    } catch {
        for (const {item, partId, position} of previous) {
            item.partId = partId;
            item.position = position;
        }
        notifyError('Erreur lors du rangement du texte');
    }
};

// Choix dans la liste : le texte va en fin de partie
const assign = (post: PostEntity, value: string) => {
    const part = parts.value.find(item => item.id === Number(value)) ?? null;
    place(post, part, Infinity);
};

// Boutons monter / descendre : le texte change de place dans sa partie
const shift = (post: PostEntity, part: PartInterface | null, index: number, offset: number) => {
    place(post, part, offset > 0 ? index + 2 : index - 1);
};

onMounted(load);
</script>
