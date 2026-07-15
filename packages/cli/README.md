# @codepair/cli

`@codepair/cli` bootstraps and diagnoses a local
[CodePair](https://github.com/yorkie-team/codepair) development environment. It is a typed,
dependency-free Node.js command-line application that owns the webhook setup implementation.

## Requirements

- Node.js 20, 22, or 24
- pnpm 9
- Docker with Docker Compose
- The Yorkie CLI on `PATH`
- A CodePair checkout

From the repository root, run the development entry point:

```sh
pnpm cli --help
```

The packed package exposes an executable named `codepair`:

```sh
codepair --version
```

## Set up Yorkie

```sh
pnpm cli setup yorkie --yes
```

Setup performs the following operations:

1. Validates the CodePair checkout, transport policy, selected URLs, and Yorkie CLI.
2. Logs in to Yorkie and creates the selected project if it does not exist.
3. Configures the `DocumentRootChanged` event webhook and verifies the result.
4. Seeds missing backend and frontend `.env.development` files from `.env.example`.
5. Writes the selected Yorkie addresses and project keys without changing unrelated values.
6. Re-reads the project and environment files to verify the postconditions.

The operation is idempotent. Existing unrelated environment settings and comments are preserved.
The default webhook is
`http://host.docker.internal:3000/yorkie/document-events`, which lets Yorkie in Docker reach the
backend on the host. Override it for a different network layout.

```text
Usage:
  codepair setup yorkie [options]

Options:
  --rpc-addr ADDRESS          Yorkie RPC address (default: localhost:8080)
  --project NAME             Yorkie project name (default: codepair)
  --username NAME            Yorkie administrator username (default: admin)
  --password-stdin           Read the Yorkie password from standard input
  --webhook-url URL          DocumentRootChanged event webhook URL
  --backend-env PATH         Backend .env.development path
  --frontend-env PATH        Frontend .env.development path
  --secure                   Use TLS; omit Yorkie's --insecure flag
  --insecure                 Use plaintext transport (the local default)
  --allow-insecure-remote    Allow plaintext login to a non-loopback host
  -y, --yes                  Confirm mutations; required when non-interactive
  --dry-run                  Validate prerequisites and print the mutation plan
  --root PATH                CodePair repository root
  --json                     Emit one structured JSON document
```

The equivalent environment variables are `YORKIE_API_ADDR`, `YORKIE_PROJECT_NAME`,
`YORKIE_USERNAME`, `YORKIE_PASSWORD`, `WEBHOOK_URL`, `BACKEND_ENV_FILE`, and
`FRONTEND_ENV_FILE`. For the Yorkie address, precedence is command-line option, process
environment, matching existing backend/frontend values, then `localhost:8080`. Conflicting
existing values require an explicit `--rpc-addr`.

For piped password input, combine `--password-stdin` with `--yes`:

```sh
printf '%s\n' "$YORKIE_PASSWORD" | codepair setup yorkie --yes --password-stdin
```

PowerShell:

```powershell
$env:YORKIE_PASSWORD | codepair setup yorkie --yes --password-stdin
```

Yorkie currently accepts its password through `yorkie login -p`. The CodePair CLI keeps piped
input out of its own command line and redacts diagnostics, but the child Yorkie process may expose
the password briefly to same-host process inspection. Run setup only on a trusted development
machine.

## Diagnose the environment

`doctor` does not change CodePair or Yorkie server state. It checks supported tool versions,
required environment values, service reachability, and whether the local Yorkie keys and webhook
match the selected project.

```sh
codepair doctor
codepair doctor --scope toolchain
codepair doctor --strict --json
```

Scopes are `all`, `toolchain`, `env`, `services`, and `yorkie`. Warnings are informational by
default; `--strict` treats them as failures. When setup used custom values, pass the matching
`--rpc-addr`, `--project`, `--webhook-url`, `--backend-env`, or `--frontend-env` options to doctor.

## Automation contract

Both commands accept `--json` and write exactly one JSON document to standard output. The stable
exit codes are:

| Code | Meaning                                                                     |
| ---: | --------------------------------------------------------------------------- |
|  `0` | The command completed successfully.                                         |
|  `1` | An operation or diagnostic check failed, or the user declined confirmation. |
|  `2` | Usage or safety validation failed, including missing non-TTY confirmation.  |

Global options (`--root`, `--json`, `--help`, and `--version`) may appear before or after the
command. JSON mode never opens an interactive prompt; pass `--yes` when a JSON setup invocation
should mutate the environment.

## Security behavior

- External commands use argument arrays without shell interpolation.
- Plaintext Yorkie login is refused for non-loopback RPC hosts unless
  `--allow-insecure-remote` is explicit. Prefer `--secure`.
- A non-interactive mutation requires `--yes`.
- Passwords and known secret fields are redacted from diagnostics and JSON.
- Environment files are replaced atomically and use owner-only permissions where supported.
- Webhook URLs containing embedded credentials are rejected.

## Package development

Run checks from `packages/cli`:

```sh
pnpm format:check
pnpm lint:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm pack:check
```

`pnpm verify` runs the complete package-local validation sequence. The build removes `dist` before
compilation so stale files cannot enter a package tarball. CI also runs `test:integration` against
pinned Yorkie CLI and server releases on Linux.
