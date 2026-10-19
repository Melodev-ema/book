<template>
    <section
        id="extrait"
        aria-labelledby="extrait-title"
        class="scroll-mt-16 border-y border-atelier-line bg-atelier-panel"
    >
        <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-20 lg:py-32">
            <div class="flex justify-center lg:col-span-7">
                <BookSpread :author="author"/>
            </div>

            <div class="flex flex-col gap-5 lg:col-span-4 lg:col-start-9">
                <span class="font-fraunces text-sm text-menthe tabular-nums">{{ number }} — Extrait gratuit</span>
                <h2
                    id="extrait-title"
                    class="font-fraunces text-4xl leading-[1.05] font-normal tracking-tight text-atelier-ink sm:text-[44px]"
                >
                    {{ heading }} <em class="italic">{{ headingEmphasis }}</em>
                </h2>
                <p class="text-base leading-relaxed text-atelier-muted">
                    {{ intro }}
                </p>

                <form
                    v-if="status !== 'success'"
                    class="mt-1 flex flex-col gap-3"
                    novalidate
                    @submit.prevent="submit"
                >
                    <label
                        for="free-sample-email"
                        class="text-sm text-atelier-muted"
                    >Adresse e-mail</label>
                    <input
                        id="free-sample-email"
                        v-model.trim="email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        required
                        placeholder="vous@exemple.fr"
                        :aria-invalid="status === 'invalid' || undefined"
                        :aria-describedby="status === 'invalid' || status === 'error' ? 'free-sample-error' : 'free-sample-note'"
                        class="h-12.5 w-full rounded-md border bg-atelier-ground px-4 text-[15px] text-atelier-ink placeholder:text-atelier-subtle focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                        :class="status === 'invalid' ? 'border-danger' : 'border-atelier-line-strong'"
                    >
                    <p
                        v-if="status === 'invalid' || status === 'error'"
                        id="free-sample-error"
                        class="text-sm text-danger"
                        role="alert"
                    >
                        {{ status === 'invalid' ? 'Merci d\'indiquer une adresse e-mail valide.' : errorMessage }}
                    </p>
                    <!-- Accord séparé et facultatif : l'extrait est envoyé que la case soit cochée ou non -->
                    <label class="flex cursor-pointer items-start gap-2.5 text-sm text-atelier-muted">
                        <input
                            v-model="newsletterConsent"
                            type="checkbox"
                            name="newsletterConsent"
                            class="mt-0.5 size-4 shrink-0 accent-lilas"
                        >
                        Je souhaite aussi recevoir les nouvelles du livre (sortie, offres). Désinscription à tout moment.
                    </label>
                    <button
                        type="submit"
                        class="flex h-12.5 items-center justify-center gap-2.5 rounded-md bg-lilas text-[15px] font-semibold text-atelier-panel transition-colors duration-150 hover:bg-lilas-light disabled:cursor-wait disabled:opacity-70"
                        :disabled="status === 'loading'"
                    >
                        <ArrowPathIcon
                            v-if="status === 'loading'"
                            class="size-4.5 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                        <PaperAirplaneIcon
                            v-else
                            class="size-4.5"
                            aria-hidden="true"
                        />
                        {{ status === 'loading' ? 'Envoi en cours…' : 'Recevoir l\'extrait' }}
                    </button>
                    <p
                        id="free-sample-note"
                        class="text-sm text-atelier-subtle"
                    >
                        {{ note }}
                        <a
                            href="/confidentialite"
                            class="underline underline-offset-2 hover:text-atelier-ink"
                        >Politique de confidentialité</a>
                    </p>
                </form>

                <div
                    v-else
                    role="status"
                    class="flex items-start gap-3 rounded-lg bg-menthe-soft px-4 py-3.5 text-[15px] text-menthe"
                >
                    <CheckIcon
                        class="mt-0.5 size-4.5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>Votre extrait est en route : il arrive dans quelques minutes à <strong class="font-semibold">{{ email }}</strong>.</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import ArrowPathIcon from "@heroicons/vue/24/outline/ArrowPathIcon";
import CheckIcon from "@heroicons/vue/24/outline/CheckIcon";
import PaperAirplaneIcon from "@heroicons/vue/24/outline/PaperAirplaneIcon";
import {ref} from "vue";
import BookSpread from "~/components/landing/BookSpread.vue";
import {ApiError, apiFetch} from "~/utils/api";
import {toast} from "~/utils/toast";

defineProps<{
    number: string;
    heading: string;
    headingEmphasis: string;
    intro: string;
    note: string;
    author?: string;
}>();

type Status = 'idle' | 'invalid' | 'loading' | 'success' | 'error';

const email = ref('');
const newsletterConsent = ref(false);
const status = ref<Status>('idle');
const errorMessage = ref('');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const submit = async () => {
    if (!EMAIL_PATTERN.test(email.value)) {
        status.value = 'invalid';
        return;
    }

    status.value = 'loading';
    try {
        await apiFetch('/api/prospect', {
            method: 'POST',
            body: {email: email.value, newsletterConsent: newsletterConsent.value},
        });
        status.value = 'success';
        toast.success('Votre extrait a été envoyé avec succès');
    } catch (error) {
        status.value = 'error';
        // 429 : extrait déjà envoyé à cette adresse aujourd'hui, ou trop de demandes
        errorMessage.value = error instanceof ApiError && error.status === 429
            ? 'L\'extrait a déjà été demandé récemment. Vérifiez votre boîte mail ou réessayez plus tard.'
            : 'L\'envoi n\'a pas abouti. Réessayez dans un instant.';
        toast.error('Une erreur est survenue');
    }
};
</script>
