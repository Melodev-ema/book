// En-têtes ajoutés à toutes les réponses du site
export function securityHeaders(pathname: string): Record<string, string> {
    const headers: Record<string, string> = {
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        // Le site n'est jamais affiché dans une iframe (pas de clickjacking sur l'admin)
        'x-frame-options': 'DENY',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    };

    // L'admin, le livre complet et l'API n'ont rien à faire dans les moteurs de recherche
    if (/^\/(admin|book|api)(\/|$)/.test(pathname)) {
        headers['x-robots-tag'] = 'noindex, nofollow';
    }

    return headers;
}
