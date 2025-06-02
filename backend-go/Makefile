CODEPAIR_VERSION := 0.2.0

default: help

tools: ## install tools for developing codepair
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.1.6

build: ## builds an executable that runs in the current environment
	go build -o ./bin/codepair ./cmd/codepair

fmt: ## applies format and simplify codes
	go fmt ./...

lint: ## runs the golang-ci lint, checks for lint violations
	golangci-lint run

fix: ## runs the golang-ci lint and fix the violations if possible
	golangci-lint run --fix

test: ## run tests
	go test -v ./...

clean: ## remove build artifacts
	rm -rf ./bin

help:
	@echo 'Commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    %-20s %s\n", $$1, $$2}'
	@echo

.PHONY: tools build fmt lint test clean help
