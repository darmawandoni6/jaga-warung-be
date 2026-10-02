.PHONY: dev build start lint format db-up db-down db-migrate db-generate db-studio clean

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

format:
	npm run format

db-up:
	podman-compose up -d || podman compose up -d || docker compose up -d

db-down:
	podman-compose down || podman compose down || docker compose down

db-migrate:
	npm run db:migrate

db-generate:
	npm run db:generate

db-studio:
	npm run db:studio

clean:
	rm -rf dist node_modules
