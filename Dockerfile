# Image de production : build Astro, puis serveur Node seul (sans les dépendances de dev)
FROM node:22-alpine AS build

ENV PUPPETEER_SKIP_DOWNLOAD=1
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Nom de domaine public, lu au build (voir README, SITE_DOMAIN)
ARG SITE_DOMAIN
ENV SITE_DOMAIN=$SITE_DOMAIN
RUN npm run build && npm prune --omit=dev


FROM node:22-alpine

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_DOWNLOAD=1

# Chromium (PDF) et Pandoc (import de fichiers)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    ca-certificates \
    pandoc-cli

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json /app/.sequelizerc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts

# Images envoyées depuis l'admin : à monter sur un volume pour les garder entre deux déploiements
RUN mkdir -p public/uploads && chown -R node:node public
VOLUME /app/public/uploads

USER node
EXPOSE 3000

# Migrations puis serveur
CMD ["sh", "-c", "npm run init-db && node dist/server/entry.mjs"]
