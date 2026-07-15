export const MAIN_HELP = `CodePair developer CLI

Usage:
  codepair setup yorkie [options]
  codepair doctor [options]
  codepair help [command]
  codepair version

Global options:
  --root PATH       CodePair repository root (or CODEPAIR_ROOT)
  --json            Emit one structured JSON document
  -h, --help        Show help
  -V, --version     Show version

Commands:
  setup yorkie      Configure the Yorkie project, event webhook, and env keys
  doctor            Diagnose the local CodePair toolchain and services
`;

export const SETUP_HELP = `Configure Yorkie for a CodePair development environment.

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
  -y, --yes                  Confirm mutations (required when non-interactive)
  --dry-run                  Validate and print the mutation plan only
  --root PATH                CodePair repository root
  --json                     Emit one structured JSON document
`;

export const DOCTOR_HELP = `Diagnose a CodePair development environment without changing server state.

Usage:
  codepair doctor [options]

Options:
  --scope SCOPE              all, toolchain, env, services, or yorkie (default: all)
  --strict                   Treat warnings as failures
  --rpc-addr ADDRESS         Expected Yorkie RPC address (default: env or localhost:8080)
  --project NAME             Expected Yorkie project name (default: env or codepair)
  --webhook-url URL          Expected DocumentRootChanged webhook URL
  --backend-env PATH         Backend environment file path
  --frontend-env PATH        Frontend environment file path
  --root PATH                CodePair repository root
  --json                     Emit one structured JSON document
`;

export function helpFor(tokens: readonly string[]): string {
	if (tokens[0] === "setup" && tokens[1] === "yorkie") return SETUP_HELP;
	if (tokens[0] === "doctor") return DOCTOR_HELP;
	return MAIN_HELP;
}
