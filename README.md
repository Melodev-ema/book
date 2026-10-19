# Livre

Application Astro (avec Vue) qui transforme des contenus (poèmes, récits, textes) en livre mis en page, prêt à être exporté en PDF.

On importe ses textes (fichiers, flux RSS ou API), on les édite dans une interface d'administration, on configure le livre (titre, dédicace, préface, format de page), puis on génère le PDF. Une page d'accueil publique présente le livre et permet de recevoir un extrait gratuit par email.

## Fonctionnalités

- **Génération du livre** : rendu HTML paginé (`/book`) converti en PDF par Puppeteer, avec plusieurs formats d'impression (poche, A5, A4, carré, etc.).
- **Administration** (`/admin`) : gestion des contenus avec éditeur riche (TipTap), statistiques, configuration du livre.
- **Import de contenus** :
  - fichiers `.json`, `.txt`, `.md`, `.html`, `.csv`, `.odt`, `.docx`. Les fichiers texte passent par Pandoc, puis par une IA qui extrait titre, auteur, date et contenu ;
  - flux RSS/Atom (extraction des articles) ;
  - API REST `/api/v1/post` authentifiée par token.
- **Prospects** : formulaire de la page d'accueil qui enregistre l'email et envoie un extrait du livre en PDF.

## Stack

- Astro 7 (rendu serveur, adaptateur Node), Vue 3, TypeScript, Pinia, vue-router
- TailwindCSS, SCSS, Headless UI, Heroicons
- PostgreSQL avec Sequelize (migrations via `sequelize-cli`)
- h3 (API `/api/*`, session admin par cookie scellé), tokens API en base
- Puppeteer et pdf-lib pour le PDF, Pandoc pour l'extraction de texte
- Vitest, ESLint, GitHub Actions

## Prérequis

- Docker et Docker Compose (méthode recommandée)
- ou, sans Docker : Node.js 22, PostgreSQL, [Pandoc](https://pandoc.org/installing.html) (pour l'import de fichiers texte)

## Démarrage avec Docker

1. Créer un fichier `.env.local` à la racine (voir [Variables d'environnement](#variables-denvironnement)) :

   ```dotenv
   SESSION_PASSWORD=une-chaine-aleatoire-d-au-moins-32-caracteres
   PDF_API_TOKEN=un-token-secret
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   ```

   Les variables `DB_*` sont déjà fournies par `docker-compose.yml`.

2. Lancer les services :

   ```bash
   make up
   ```

   Le conteneur `app` joue les migrations (`npm run init-db`) puis démarre le serveur de dev.

3. Ouvrir :
   - l'application sur http://localhost:3000
   - l'administration sur http://localhost:3000/admin
   - MailHog (emails envoyés en local) sur http://localhost:8025

Commandes utiles :

| Commande | Effet |
| --- | --- |
| `make up` / `make down` | Démarrer / arrêter les conteneurs |
| `make rebuild` | Reconstruire l'image puis redémarrer |
| `make logs` | Suivre les logs de l'application |
| `make shell` | Ouvrir un shell dans le conteneur `app` |
| `make clean` | Tout arrêter et supprimer les volumes (**efface la base**) |

## Démarrage sans Docker

```bash
npm ci
```

Créer un fichier `.env` avec au minimum les variables `DB_*` pointant vers votre PostgreSQL (par exemple `DB_HOST=localhost`), `SESSION_PASSWORD` et `PDF_API_TOKEN`.

`sequelize-cli` ne lit pas le fichier `.env` : il faut exporter les variables avant de lancer les migrations.

```bash
set -a && source .env && set +a && npm run init-db
```

```bash
npm run dev
```

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connexion PostgreSQL. En dev, valeurs par défaut `postgres` / `5432` / `user` / `livre`. Obligatoires en production. |
| `SESSION_PASSWORD` | Clé de chiffrement de la session admin (32 caractères minimum). |
| `PDF_API_TOKEN` | Secret qui autorise Puppeteer à ouvrir `/book?token=...` pour générer le PDF. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | IA utilisée pour l'import de fichiers texte (endpoint Gemini compatible OpenAI). Prioritaire si la clé est définie. |
| `AI_API_URL`, `AI_MODEL` | Sinon, serveur local compatible OpenAI (Ollama par exemple, `AI_API_URL=http://host.docker.internal:11434/`). |
| `SMTP_URL` | Serveur d'envoi des emails (extrait gratuit), par exemple `smtps://utilisateur:motdepasse@smtp.exemple.fr:465`. Par défaut, MailHog de `docker-compose.yml`. |
| `MAIL_FROM` | Adresse d'expédition des emails. |
| `SITE_DOMAIN` | Nom de domaine public (ex. `livre.exemple.fr`), à définir **au build**. Derrière un proxy, il permet de lire l'IP réelle des visiteurs (`X-Forwarded-For`), utilisée pour limiter les tentatives de connexion et les demandes d'extrait. |
| `PUPPETEER_EXECUTABLE_PATH` | Chemin vers Chromium. Déjà défini dans l'image Docker ; inutile en local, où Puppeteer utilise son propre Chromium. |

Les fichiers `.env` et `.env.*` sont ignorés par git.

## Base de données

Les migrations se trouvent dans `migrations/` (fichiers `.cjs`), la configuration Sequelize dans `config/config.cjs`.

| Commande (Docker) | Effet |
| --- | --- |
| `make migration-run` | Appliquer les migrations |
| `make migration-create NAME=<nom>` | Créer une migration (renommée en `.cjs`) |
| `make migration-undo` | Annuler la dernière migration |
| `make migration-reset` | Tout annuler puis tout rejouer |

Hors Docker : `npm run init-db` et `npm run create-migration -- <nom>`.

Une migration crée un compte administrateur `admin@admin.com`, dont le mot de passe est public : en production, la connexion avec ce mot de passe est refusée. Pour créer votre compte (ou changer un mot de passe) :

```bash
npm run admin:password -- vous@exemple.fr --disable-default
```

Le mot de passe (12 caractères minimum) est demandé sans écho. `--disable-default` désactive `admin@admin.com`. Comme les migrations, le script lit les variables `DB_*` de l'environnement (dans Docker : `make shell` puis la commande).

## Import de contenus

Depuis `/admin/import` :

- **Fichiers** (5 Mo maximum chacun) : les fichiers `.json` (un texte `{postTitle, author, content, publishDate}` ou un tableau de textes) sont importés directement ; les autres formats sont convertis en texte par Pandoc, nettoyés, puis envoyés à l'IA qui renvoie un contenu structuré. Les imports passent par une file de traitement en mémoire, dont le statut est visible dans l'interface.
- **Flux RSS** : le contenu complet de chaque article du flux est extrait. Chaque article reçoit un identifiant externe unique, ce qui empêche de l'importer deux fois.
- **API** : créer un token dans l'onglet API (5 tokens actifs maximum), puis :

  ```bash
  curl -X POST http://localhost:3000/api/v1/post \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"postTitle": "Titre", "author": "Auteur", "content": "<p>Texte</p>", "publishDate": "2025-01-01"}'
  ```

Le contenu HTML est assaini (DOMPurify) avant d'être enregistré.

## Génération du PDF

1. Configurer le livre dans `/admin/book/settings` : titre, auteur, années, dédicace, préface, format de page, nombre de lignes par page, numéro de la première page.
2. Prévisualiser dans `/admin/book`, puis télécharger le PDF.

Le serveur lance Puppeteer sur `/book?token=<PDF_API_TOKEN>`, imprime la page au format CSS choisi, puis retire avec pdf-lib les pages blanches en trop. La page `/book` n'est accessible qu'à un admin connecté ou avec ce token.

## Tests et qualité

```bash
npm test
```

```bash
npm run lint
```

La CI GitHub Actions (`.github/workflows/ci.yml`) lance `npm ci`, le lint, la vérification des types (`npm run check`), les tests et le build à chaque push sur `main` et `dev`, ainsi que sur chaque pull request.

### Qualité de l'import de fichiers (promptfoo)

`evals/` vérifie avec [promptfoo](https://promptfoo.dev) que l'import d'un fichier (Pandoc, nettoyage, IA) donne le bon titre, auteur, date et contenu, sans résidus de mise en forme. Il appelle vraiment l'IA configurée dans `.env` (Gemini ou Ollama) : il n'est donc pas lancé par la CI.

```bash
npm run eval        # lance les cas de evals/promptfooconfig.yaml
npm run eval:view   # ouvre le détail dans le navigateur
```

Pour ajouter un cas : déposer le fichier dans `evals/fixtures/`, écrire le contenu attendu dans `evals/attendu/` (`npx tsx evals/voir-texte.ts <fichier>` montre le texte que reçoit l'IA), puis déclarer le cas dans `tests:`. Ajouter `--repeat 3` à `npm run eval --` pour vérifier que les réponses de l'IA sont stables.

## Production

### Avec Docker

Le `Dockerfile` construit une image de production (le développement utilise `Dockerfile.dev`) :

```bash
docker build --build-arg SITE_DOMAIN=livre.exemple.fr -t livre .
```

```bash
docker run -d -p 3000:3000 --env-file .env.production -v livre-uploads:/app/public/uploads livre
```

Au démarrage, le conteneur joue les migrations puis lance le serveur. Le volume `/app/public/uploads` garde les images envoyées depuis l'admin (photo de l'auteur, couverture) entre deux déploiements ; le serveur les sert lui-même sous `/uploads/`. Ensuite, créer le compte administrateur :

```bash
docker exec -it <conteneur> npm run admin:password -- vous@exemple.fr --disable-default
```

### Purge des prospects (job planifié)

La politique de confidentialité annonce des durées de conservation : un script les applique, en effaçant les adresses
trop anciennes (la demande reste comptée dans les statistiques).

- sans accord pour les nouvelles du livre : 30 jours après la demande d'extrait ;
- abonnés : 3 ans après leur dernier contact (une nouvelle demande d'extrait repousse ce délai).

Le serveur web ne le lance pas lui-même : il faut le planifier. Avec **Scaleway Serverless Jobs**, créer un job :

- **image** : la même que le site (celle construite par le `Dockerfile`) ;
- **commande** : `node dist/scripts/purge-prospects.mjs` ;
- **planification** : chaque nuit, par exemple `0 3 * * *` (fuseau `Europe/Paris`) ;
- **variables d'environnement** : `NODE_ENV=production` et les `DB_*` du site (en secrets).

Le script affiche le nombre d'adresses effacées et sort en erreur (code 1) si la base est injoignable : le job apparaît
alors en échec dans la console. Pour le lancer à la main : `npm run purge` (après `npm run build`).

**Sans ce job, rien n'est purgé** : à vérifier à chaque mise en production.

### Sans Docker

```bash
npm run build
```

```bash
npm start
```

Le serveur a besoin des variables d'environnement ci-dessus, de Pandoc et d'un Chromium accessible par Puppeteer. En production, il répond 500 tant que `SESSION_PASSWORD` (32 caractères minimum), `PDF_API_TOKEN` (16 minimum) et `DB_HOST`, `DB_NAME`, `DB_USER` ne sont pas définis.

Protections intégrées (en mémoire, valables pour une seule instance du serveur) :

- connexion : 10 tentatives par IP et par quart d'heure ;
- extrait gratuit : 3 demandes par IP et par heure, 1 par adresse email et par jour, 60 par heure au total ;
- requêtes limitées à 20 Mo, images du livre à 10 Mo (JPEG ou PNG vérifiés) ;- en-têtes de sécurité sur toutes les pages (pas d'affichage en iframe, `nosniff`…), et `noindex` sur l'admin, le livre et l'API ;
- polices servies par le site (aucune requête vers Google Fonts).

## Structure

```
components/   Composants Vue (admin, livre, landing, ui, layout)
src/pages/    Routes Astro : accueil, /book, /uploads/*, /admin/*, /api/* (transmis à h3)
src/admin/    Appli Vue de l'admin (vue-router, vues, layouts)
src/layouts/  Layout Astro de base
src/middleware.ts  Middleware Astro (accès admin et livre)
stores/       Stores Pinia
entities/     Entités et schémas de validation partagés
server/
  api/        Endpoints (admin, import, v1, génération PDF)
  middleware/ Protection des routes API (session, token)
  models/     Modèles Sequelize
  services/   PDF, import, IA, Pandoc, email
migrations/   Migrations Sequelize
assets/       Styles (dont formats de page) et images
```
