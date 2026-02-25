# CodePair

AI-powered collaborative markdown editor. React + NestJS + Yorkie CRDT, pnpm monorepo.

## Development Commands

```sh
pnpm install                    # Install all dependencies

# Frontend
pnpm frontend dev               # Start frontend dev server
pnpm frontend build              # Build (tsc + vite)
pnpm frontend lint               # Lint frontend

# Backend
pnpm backend start:dev           # NestJS watch mode
pnpm backend build               # Build backend
pnpm backend test                # Jest unit tests
pnpm backend test:e2e            # End-to-end tests
pnpm backend db:generate         # Regenerate Prisma client

# All
pnpm lint                        # Lint all packages
pnpm format:check                # Check formatting

# API client generation
pnpm generate:frontend           # Generate TypeScript API client from OpenAPI spec
```

## After Making Changes

Always run before submitting:
```sh
pnpm lint && pnpm format:check && pnpm backend test
```

For database schema changes: `pnpm backend db:generate`
For API changes: `pnpm generate:frontend` to regenerate the frontend API client.

## Gotchas

- Prettier config: tabs, 4-space width, 100 chars, double quotes, semicolons — different from other yorkie projects
- Frontend API client is auto-generated from OpenAPI spec (`api/backend-openapi-spec.json`) — don't edit `frontend/src/api/` manually
- Backend uses MongoDB via Prisma ORM — schema at `backend/prisma/schema.prisma`
- Auth: GitHub OAuth -> JWT access/refresh tokens
- AI features use LangChain with OpenAI/Ollama + Qdrant for RAG
- Frontend tests are not currently configured
- Desktop app uses Electron via electron-vite
