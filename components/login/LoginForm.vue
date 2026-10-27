<template>
    <div class="grid min-h-screen grid-cols-1 bg-atelier-ground font-instrument text-atelier-ink antialiased lg:grid-cols-2">
        <div
            class="relative hidden items-center justify-center overflow-hidden border-r border-atelier-line bg-atelier-panel lg:flex"
            aria-hidden="true"
        >
            <a
                href="/"
                class="absolute top-8 left-10 flex items-center gap-2.5 text-atelier-ink"
                tabindex="-1"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    class="text-lilas"
                ><path
                    d="M0 5h5V0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"/><path
                    d="M18 13h-5v5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"/></svg>
                <span class="font-fraunces text-lg font-medium">L'atelier</span>
            </a>
            <div class="relative flex shadow-page">
                <div class="flex aspect-[148/210] w-[min(18vw,250px)] flex-col items-center bg-page px-[11%] pt-[12%]">
                    <span class="font-newsreader text-[0.4rem] tracking-[0.2em] text-page-muted uppercase">Dédicace</span>
                    <span class="mt-[45%] text-center font-newsreader text-sm text-page-ink italic">{{ dedication }}</span>
                </div>
                <div class="flex aspect-[148/210] w-[min(18vw,250px)] flex-col gap-1.5 border-l border-page-ink/5 bg-page px-[11%] pt-[26%]">
                    <span class="mb-3 h-1.5 w-1/2 bg-page-ink/80"/>
                    <span
                        v-for="(width, index) in [70, 55, 62, 40, 0, 58, 46]"
                        :key="index"
                        class="h-[3px] rounded-full bg-page-ink/12"
                        :class="{ 'mt-2': width === 0 }"
                        :style="{ width: `${width}%` }"
                    />
                </div>
                <span class="absolute -top-6 left-0 h-3.5 w-px bg-atelier-line-strong"/>
                <span class="absolute top-0 -left-6 h-px w-3.5 bg-atelier-line-strong"/>
                <span class="absolute right-0 -bottom-6 h-3.5 w-px bg-atelier-line-strong"/>
                <span class="absolute -right-6 bottom-0 h-px w-3.5 bg-atelier-line-strong"/>
            </div>
        </div>

        <main class="flex items-center justify-center px-5 py-16">
            <form
                class="flex w-full max-w-[380px] flex-col gap-5"
                aria-labelledby="login-title"
                novalidate
                @submit.prevent="$emit('submit')"
            >
                <div class="flex flex-col gap-2.5">
                    <h1
                        id="login-title"
                        class="font-fraunces text-[44px] leading-[1.05] font-light tracking-tight"
                    >
                        Retour <em class="italic">à l'atelier</em>
                    </h1>
                    <p class="text-[15px] text-atelier-muted">Connectez-vous pour gérer vos contenus et votre livre.</p>
                </div>

                <div class="flex flex-col gap-2">
                    <label
                        for="email"
                        class="text-[13px] text-atelier-muted">Adresse e-mail</label>
                    <input
                        id="email"
                        :value="credentials.email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        required
                        :aria-invalid="error ? true : undefined"
                        :aria-describedby="error ? 'login-error' : undefined"
                        class="h-12 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-3.5 text-[15px] text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                        @input="updateCredentialsEmail"
                    >
                </div>

                <div class="flex flex-col gap-2">
                    <label
                        for="password"
                        class="text-[13px] text-atelier-muted">Mot de passe</label>
                    <input
                        id="password"
                        :value="credentials.password"
                        type="password"
                        name="password"
                        autocomplete="current-password"
                        required
                        :aria-invalid="error ? true : undefined"
                        :aria-describedby="error ? 'login-error' : undefined"
                        class="h-12 w-full rounded-md border border-atelier-line-strong bg-atelier-panel px-3.5 text-[15px] text-atelier-ink focus:border-lilas focus:ring-3 focus:ring-lilas-soft focus:outline-none"
                        @input="updateCredentialsPassword"
                    >
                </div>

                <button
                    type="submit"
                    class="flex h-12 items-center justify-center gap-2 rounded-md bg-lilas text-[15px] font-semibold text-atelier-panel transition-colors duration-150 hover:bg-lilas-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilas disabled:cursor-wait disabled:opacity-70"
                    :disabled="loading"
                >
                    <ArrowPathIcon
                        v-if="loading"
                        class="size-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"/>
                    {{ loading ? 'Connexion…' : 'Se connecter' }}
                </button>

                <div
                    v-if="error"
                    id="login-error"
                    role="alert"
                    class="flex gap-2.5 rounded-lg bg-danger-soft px-3.5 py-3 text-sm leading-snug text-danger"
                >
                    <ExclamationCircleIcon
                        class="mt-px size-4.5 shrink-0"
                        aria-hidden="true"/>
                    <span>{{ error }}</span>
                </div>
            </form>
        </main>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ArrowPathIcon, ExclamationCircleIcon} from "@heroicons/vue/24/outline";

export default defineComponent({
    name: "LoginForm",
    components: {ArrowPathIcon, ExclamationCircleIcon},
    props: {
        credentials: {
            type: Object as () => { email: string, password: string },
            default: () => ({email: '', password: ''})
        },
        error: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        dedication: {
            type: String,
            default: 'À celles et ceux qui lisent lentement.',
        },
    },
    emits: ['submit', 'update:credentials'],
    methods: {
        updateCredentialsEmail(event: Event) {
            const target = event.target as HTMLInputElement;
            const credentials = {...this.credentials, email: target.value};
            this.$emit('update:credentials', credentials);
        },
        updateCredentialsPassword(event: Event) {
            const target = event.target as HTMLInputElement;
            const credentials = {...this.credentials, password: target.value};
            this.$emit('update:credentials', credentials);
        }
    }
});

</script>
