.PHONY: up-dev down-dev up-prod down-prod logs

up-dev:
	docker compose --profile dev up --build

down-dev:
	docker compose --profile dev down -v

up-prod:
	docker compose up --build db api web

down-prod:
	docker compose down -v

logs:
	docker compose logs -f --tail=100