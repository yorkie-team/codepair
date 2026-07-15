---
created: 2026-07-15
updated: 2026-07-15
tags: [cli, developer-tooling]
---

# CodePair CLI

## Problem

Local CodePair setup was implemented as a standalone JavaScript script. It was not typed,
packaged, or easy to validate across the operating systems and Node.js versions that CodePair
supports. Adding more setup operations to that script would make its command surface and failure
handling increasingly difficult to maintain.

### Goals

- Provide a typed Node.js CLI in the pnpm workspace.
- Offer clear setup and diagnostic commands for contributors and automation.
- Preserve the existing `pnpm setup:webhook` workflow.
- Validate the built and installed package across the supported Node.js versions and operating systems.

### Non-Goals

- Replace the Yorkie CLI or Yorkie server.
- Change the frontend or backend runtime architecture.
- Provide production deployment orchestration.

## Design

The CLI lives in `packages/cli` as `@codepair/cli`. Contributors invoke it from the repository
root with `pnpm cli <arguments>`, which delegates to the package's development entry point.
`setup yorkie` owns local Yorkie project and webhook configuration, while `doctor` reports
toolchain, environment, service, and Yorkie readiness.

The existing `pnpm setup:webhook` command remains a non-interactive compatibility entry point. Its
root-level wrapper preserves the legacy webhook default and trusted-remote behavior, then delegates
to the CLI, which is the only implementation of the workflow. New automation should invoke
`pnpm cli setup yorkie --yes` and opt into any remote plaintext transport explicitly.

When development environment files do not exist, setup seeds them from the checked-in
`.env.example` files. It then writes only the selected Yorkie addresses and project keys, leaving
OAuth, JWT, AI provider, and storage settings untouched. The default webhook uses
`host.docker.internal` so Yorkie running in Docker can reach the backend's published host port;
`--webhook-url` supports other network layouts.

Commands return `0` on success, `1` for operational or diagnostic failure or an explicit user
decline, and `2` for invalid usage, safety validation, or a required confirmation in a non-TTY
environment. Both setup and doctor support structured JSON output so automation does not need to
parse human-readable messages.

CI pairs Linux, macOS, and Windows with Node.js 22, 20, and 24 respectively, covering every
supported operating system and Node.js major with three jobs rather than a nine-job Cartesian
matrix. Each job runs formatting, linting, type checking, unit tests, end-to-end tests, and an
installed-package smoke test. The Linux job also runs control-plane setup, idempotency, and doctor
checks against pinned Yorkie CLI and server releases.

### Risks and Mitigation

| Risk                                                      | Mitigation                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| The compatibility command changes behavior                | Preserve its legacy webhook and plaintext-remote defaults in the wrapper and test both paths. |
| The CLI works in the workspace but not after packaging    | Install and execute the packed artifact in CI on all supported platforms.                     |
| Platform-specific process or path behavior regresses      | Run the CLI validation suite on Ubuntu, macOS, and Windows.                                   |
| A fake Yorkie misses a protocol or configuration mismatch | Run one pinned real-Yorkie integration path on Linux.                                         |
| The container cannot reach a host backend                 | Add a host gateway mapping and use a container-reachable default webhook URL.                 |

### Design Decisions

| Decision                                             | Reason                                                                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Place the CLI under `packages/cli`                   | The existing `packages/*` workspace glob discovers it without special workspace configuration.                                           |
| Keep the package private                             | The CLI configures a repository checkout; avoiding an npm release contract keeps ownership within the existing monorepo release process. |
| Route root commands through the package `dev` script | Contributors can run the TypeScript entry point without a separate root implementation.                                                  |
| Keep `setup:webhook` as a root alias                 | Existing documentation and automation continue to work.                                                                                  |
| Test the packed package in CI                        | Source-level tests alone cannot validate binary metadata or installation behavior.                                                       |
| Use a three-job compatibility matrix                 | It covers each supported OS and Node.js major without nine full workspace installs.                                                      |

## Alternatives Considered

| Alternative                              | Why not                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Extend `scripts/setup-yorkie-webhook.js` | It would keep the setup flow untyped, unpackaged, and difficult to test across platforms. |
| Put CLI commands in the backend package  | CLI startup and packaging should not depend on the NestJS application lifecycle.          |
| Remove `pnpm setup:webhook` immediately  | It would break existing contributor workflows and automation without a migration period.  |

## Tasks

No separate execution task document is required for this focused integration.
