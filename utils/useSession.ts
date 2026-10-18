import {ref} from 'vue';
import type {SessionUser} from '../server/utils/session';
import {apiFetch} from './api';

// État partagé par tous les composants
const loggedIn = ref(false);
const user = ref<SessionUser | null>(null);

export function useSession() {
    async function fetch(): Promise<void> {
        const data = await apiFetch<{loggedIn: boolean; user: SessionUser | null}>('/api/session');
        loggedIn.value = data.loggedIn;
        user.value = data.user;
    }

    async function clear(): Promise<void> {
        await apiFetch('/api/session', {method: 'DELETE'});
        loggedIn.value = false;
        user.value = null;
    }

    return {loggedIn, user, fetch, clear};
}
