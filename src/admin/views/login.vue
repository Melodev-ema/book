<template>
    <LoginForm
        v-model:credentials="credentials"
        :error="errorMessage"
        :loading="submitting"
        @submit="submit"
    />
</template>

<script lang="ts">
import {defineComponent} from "vue";
import LoginForm from "~/components/login/LoginForm.vue";
import {apiTry} from "~/utils/api";
import {toast} from "~/utils/toast";
import {useSession} from "~/utils/useSession";

export default defineComponent({
    name: "LoginPage",
    components: {LoginForm},
    data() {
        return {
            credentials: {
                email: '',
                password: '',
            },
            errorMessage: '',
            submitting: false,
        };
    },
    methods: {
        async submit() {
            this.errorMessage = '';
            if (!this.credentials.email || !this.credentials.password) {
                this.errorMessage = 'Renseignez votre adresse e-mail et votre mot de passe.';
                return;
            }
            this.submitting = true;
            const {error} = await apiTry('/api/login', {
                method: 'POST',
                body: this.credentials,
            });

            if (error) {
                this.submitting = false;
                this.errorMessage = 'Identifiants incorrects. Vérifiez l\'adresse et le mot de passe.';
                toast.error('Erreur lors de la connexion');
                return;
            }

            await useSession().fetch();
            await this.$router.push('/');
        }
    }
});
</script>
