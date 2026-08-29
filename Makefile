.PHONY: all test test-node test-go build build-node build-go lint format docs docs-node docs-go clean

all: test build

test:
	npm test

test-node:
	npm run test:node

test-go:
	npm run test:go

build:
	npm run build

build-node:
	npm run build:node

build-go:
	npm run build:go

lint:
	npm run lint

format:
	npm run format

format-check:
	npm run format:check

docs: docs-node

docs-node:
	npm run docs:node

docs-go:
	npm run docs:go

clean:
	rm -rf packages/node/dist packages/node/docs packages/node/coverage
