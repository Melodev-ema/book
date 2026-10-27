type Env = Record<string, string | undefined>;

// Configuration indispensable en production : sans elle, le site tournerait sans protection
// (session déchiffrable, page du livre ouverte) ou sans base
export function envProblems(env: Env): string[] {
    const problems: string[] = [];

    if ((env.SESSION_PASSWORD ?? '').length < 32) {
        problems.push('SESSION_PASSWORD doit faire au moins 32 caractères');
    }
    if ((env.PDF_API_TOKEN ?? '').length < 16) {
        problems.push('PDF_API_TOKEN doit faire au moins 16 caractères');
    }
    // Sans domaine au build, Astro ignore X-Forwarded-For : derrière un proxy, tous les visiteurs auraient la même IP
    // et se partageraient les limites d'essais (login, extrait gratuit)
    if (!env.BUILD_SITE_DOMAIN) {
        problems.push('SITE_DOMAIN n\'était pas défini au build (docker build --build-arg SITE_DOMAIN=…)');
    }
    for (const name of ['DB_HOST', 'DB_NAME', 'DB_USER']) {
        if (!env[name]) {
            problems.push(`${name} n'est pas défini`);
        }
    }

    return problems;
}

let checked = false;

// Vérifiée à la première requête en production : tant qu'il manque quelque chose, le site répond 500
// BUILD_SITE_DOMAIN est remplacé au build par sa valeur (astro.config.mjs)
export function assertProductionEnv(env: Env = {...process.env, BUILD_SITE_DOMAIN: process.env.BUILD_SITE_DOMAIN}): void {
    if (checked || env.NODE_ENV !== 'production') {
        return;
    }
    const problems = envProblems(env);
    if (problems.length > 0) {
        throw new Error(`Configuration incomplète : ${problems.join(' ; ')}`);
    }
    checked = true;
}
