.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.DEFAULT_GOAL := help

.PHONY: install-deps
install-deps: ## install dependencies
	which yarn || npm install -g yarn
	yarn

.PHONY: format
format: ## format codes
	yarn run fix

.PHONY: lint
lint: ## lint codes
	yarn run lint

.PHONY: build
build: ## build
	yarn run build

.PHONY: test
test: ## test codes
	yarn run test

.PHONY: synth
synth: ## synth
	yarn run cdk synth \
		--path-metadata false \
		--version-reporting false

.PHONY: ci-test
ci-test: install-deps lint build test synth ## ci test

.PHONY: deploy
deploy: ## deploy all the stacks
	yarn run cdk deploy --all
