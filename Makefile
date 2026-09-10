.PHONY: install typecheck test lint format format-check build demo pack publish

NPM ?= pnpm

install:
	$(NPM) install

typecheck:
	$(NPM) run typecheck

test:
	$(NPM) test

lint:
	$(NPM) run lint

format:
	$(NPM) run format

format-check:
	$(NPM) run format:check

build: typecheck lint format-check
	$(NPM) run build

demo:
	$(NPM) run demo

pack: build
	$(NPM) pack --dry-run

publish: build
	$(NPM) publish --access public
