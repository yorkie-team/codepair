# CodePair

AI-powered collaborative markdown editor built on Yorkie CRDT. Supports real-time editing, workspaces, document sharing, and LLM-assisted writing.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, MUI 6, Redux Toolkit, CodeMirror 6, TanStack Query
- **Backend**: NestJS 11, Prisma (MongoDB), Passport (GitHub OAuth + JWT), LangChain, AWS S3
- **Desktop**: Electron 33, electron-vite
- pnpm 9.4+ monorepo, ESLint 9, Prettier, Husky

## Development Commands

```sh
pnpm install                    # Install all dependencies

# Frontend
pnpm frontend dev               # Start frontend dev server
pnpm frontend build              # Build frontend (tsc + vite)
pnpm frontend lint               # Lint frontend

# Backend
pnpm backend start:dev           # Start backend in watch mode
pnpm backend build               # Build backend (nest build)
pnpm backend test                # Run Jest unit tests
pnpm backend test:e2e            # Run end-to-end tests
pnpm backend db:generate         # Regenerate Prisma client

# Desktop
pnpm desktop dev                 # Start Electron dev
pnpm desktop build-electron      # Build desktop app

# All
pnpm lint                        # Lint all packages in parallel
pnpm format                      # Format all packages
pnpm format:check                # Check formatting

# API client generation
pnpm generate:frontend           # Generate TypeScript API client from OpenAPI spec
```

## Project Structure

```
frontend/src/
  features/           # Feature modules (auth, workspace, document, editor, intelligence)
  components/         # UI components (cards, modals, layouts, headers)
  store/              # Redux state management
  pages/              # Route pages
  hooks/              # Custom React hooks
  api/                # Generated API client (from OpenAPI spec)

backend/src/
  auth/               # GitHub OAuth + JWT (Passport strategies, guards)
  workspaces/         # Workspace management
  workspace-users/    # Workspace membership
  workspace-documents/ # Document-workspace relations
  documents/          # Document CRUD
  intelligence/       # AI features (LLM integration)
  langchain/          # LangChain setup
  rag/                # Retrieval-Augmented Generation
  files/              # File upload management
  storage/            # AWS S3 integration
  users/              # User management
  settings/           # App settings
  check/              # Health checks
  db/                 # Prisma service
  app.module.ts       # Root NestJS module

backend/prisma/
  schema.prisma       # MongoDB schema (User, Workspace, Document, etc.)

desktop/src/          # Electron main/renderer

api/                  # OpenAPI spec (backend-openapi-spec.json)
docs/                 # Setup documentation (GitHub OAuth)
```

## Code Conventions

- Prettier: tabs, 4-space width, 100 chars, double quotes, trailing commas (es5), semicolons
- ESLint: TypeScript strict, no explicit any in backend, react-hooks rules in frontend
- Backend tests: Jest with NestJS Testing module, mock-based service testing
- Frontend tests: Not currently configured
- Pre-commit hook: lint-staged runs ESLint + Prettier on changed files
- Commit messages: subject max 70 chars, body at 80 chars

## Architecture Notes

- **Real-time editing**: Yorkie SDK syncs CodeMirror documents via CRDT
- **AI integration**: LangChain with OpenAI/Ollama for intelligent writing assistance
- **Vector search**: Qdrant for RAG (Retrieval-Augmented Generation)
- **Auth flow**: GitHub OAuth -> JWT access/refresh tokens (86400s/604800s)
- **API generation**: OpenAPI spec -> TypeScript Axios client for frontend
- **Database**: MongoDB via Prisma ORM
- **File storage**: AWS S3 for document attachments
