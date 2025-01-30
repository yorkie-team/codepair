CODEPAIR_VERSION := 0.2.0

default: help

tools: ## install tools for developing codepair
	@echo "TODO: add tools"

build: ## builds an executable that runs in the current environment
	go build -o ./bin/codepair cmd/codepair/main.go

help:
	@echo 'Commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    %-20s %s\n", $$1, $$2}'
	@echo

.PHONY: tools help
