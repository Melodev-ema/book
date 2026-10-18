# --- variables ajustables ---------------------------------
DC       ?= docker compose
SERVICE  ?= app
EXEC     := $(DC) exec $(SERVICE)

# --- cibles ------------------------------------------------
.PHONY: dev build preview lint lint-fix migration-create migration-run migration-undo migration-reset up down logs

# --- dev ----------------------------------------------------
dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

lint-fix:
	npm run lint:fix

# --- docker -------------------------------------------------
up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) restart

rebuild:
	$(DC) up -d --build

ps:
	$(DC) ps

logs:
	$(DC) logs -f $(SERVICE)

logs-all:
	$(DC) logs -f

shell:
	$(EXEC) sh

clean:
	$(DC) down -v --remove-orphans

# --- migrations ---------------------------------------------

## make migration-create NAME=create-entity
migration-create:
	@if [ -z "$(NAME)" ]; then \
		echo "Merci de préciser le nom : make migration-create NAME=<nom_migration>"; \
		exit 1; \
	fi
	$(EXEC) npx sequelize-cli migration:create --name $(NAME)&& \
    for f in migrations/*-$(NAME).js; do mv "$$f" "$${f%.js}.cjs"; done

migration-run:
	$(EXEC) npx sequelize-cli db:migrate

migration-undo:
	$(EXEC) npx sequelize-cli db:migrate:undo

migration-reset:
	$(EXEC) npx sequelize-cli db:migrate:undo:all
	$(EXEC) npx sequelize-cli db:migrate