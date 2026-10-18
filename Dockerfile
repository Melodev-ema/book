FROM node:22-alpine

# Variables pour installer glibc depuis le repo sgerrand
ENV GLIBC_VERSION=2.35-r0 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# 1. Installer Chromium + glibc-compatibilty + dépendances
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++ \
    gcompat \
    wget \
    ca-certificates \
    pandoc-cli \
    pandoc-cli-doc

# Copie des fichiers de package
COPY package.json package-lock.json ./

RUN npm ci

# Copie des sources
#COPY . .

# Build de l'appli
# RUN npm run build

EXPOSE 3000 4000

CMD [ "npm", "run", "dev" ]
