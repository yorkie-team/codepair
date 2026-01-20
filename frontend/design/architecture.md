# Frontend Architecture

This document describes the feature-based architecture of the CodePair frontend application.

## Overview

The frontend has been refactored from a **type-based structure** to a **feature-based architecture** for better modularity, cohesion, and maintainability.

## Why Modular Architecture?

The primary goal of this architecture is to **make implementation swappable**.

### Easier Technology Replacement

Each feature encapsulates its implementation details behind a clean public API (`index.ts`). This means:

- **Editor replacement**: The `editor` feature currently uses CodeMirror, but if we need to switch to Monaco, ProseMirror, or any other editor, we only need to modify files inside `features/editor/`. The rest of the application only imports from `@/features/editor` and doesn't know or care about CodeMirror internals.

- **AI provider swap**: The `intelligence` feature handles AI/LLM integration. Switching from one AI provider to another only requires changes within `features/intelligence/`.

- **Auth mechanism change**: Moving from JWT to OAuth or adding SSO? Changes stay within `features/auth/`.

### Isolation of Change

```
┌─────────────────────────────────────────────────────┐
│  Application                                        │
│  ┌───────────────┐  ┌───────────────┐              │
│  │ pages/        │  │ components/   │              │
│  │               │  │               │              │
│  └───────┬───────┘  └───────┬───────┘              │
│          │                  │                       │
│          │   Public API     │                       │
│          ▼   (index.ts)     ▼                       │
│  ┌─────────────────────────────────────────────┐   │
│  │              features/editor                 │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │  Internal Implementation             │    │   │
│  │  │  (CodeMirror, Yorkie sync, etc.)    │    │   │
│  │  │                                      │    │   │
│  │  │  ← Changes here don't leak out      │    │   │
│  │  └─────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Practical Example: Replacing CodeMirror

If we decide to replace CodeMirror with a different editor:

| Without modular architecture                                                   | With modular architecture                    |
| ------------------------------------------------------------------------------ | -------------------------------------------- |
| Find all CodeMirror imports across `components/`, `hooks/`, `utils/`, `store/` | All CodeMirror code is in `features/editor/` |
| Update 15+ files in different directories                                      | Update files in one directory                |
| Risk breaking unrelated features                                               | Changes isolated to editor feature           |
| Hard to test incrementally                                                     | Can test editor feature in isolation         |

This is the core value: **features are replaceable units** with stable interfaces.

## Before vs After

### Type-based Structure (Before)

Files were organized by their **technical type**: all components together, all hooks together, all store slices together, etc.

```
src/
├── components/
│   ├── common/
│   ├── editor/           # Editor components
│   │   ├── Editor.tsx
│   │   ├── Preview.tsx
│   │   ├── ToolBar.tsx
│   │   └── ...
│   ├── headers/
│   ├── layouts/
│   └── modals/
├── hooks/
│   ├── useToolBar.ts     # Editor-related hook
│   ├── useYorkieDocument.ts
│   └── api/
├── store/
│   ├── editorSlice.ts    # Editor state
│   ├── documentSlice.ts
│   ├── userSlice.ts
│   └── ...
├── utils/
│   ├── yorkie/           # Editor utility
│   ├── document.ts
│   └── ...
├── contexts/
├── providers/
└── pages/
```

**Problems with this approach:**

- Related code is scattered across multiple directories
- Hard to understand what code belongs to which feature
- Difficult to modify or extend a feature without touching many directories
- No clear boundaries between features

### Feature-based Structure (After)

Files are now organized by **domain/feature**: each feature contains its own components, hooks, store, and utils.

```
src/
├── features/                    # Feature modules (self-contained)
│   ├── auth/                    # Authentication feature
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── providers/
│   │   ├── store/
│   │   └── index.ts
│   ├── editor/                  # Editor feature (largest)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   └── index.ts
│   ├── document/                # Document management & sharing
│   ├── intelligence/            # AI features
│   ├── settings/                # App settings
│   ├── user/                    # User profile
│   └── workspace/               # Workspace management
│
├── components/                  # Shared UI components (not feature-specific)
│   ├── common/
│   ├── headers/
│   ├── layouts/
│   ├── modals/
│   └── ...
├── hooks/                       # Shared hooks
│   ├── api/                     # API query hooks (React Query)
│   └── useCurrentTheme.ts
├── store/                       # Redux store configuration only
│   └── store.ts
├── utils/                       # Shared utilities
│   ├── axios.default.ts
│   └── ...
├── constants/                   # Shared constants
└── pages/                       # Route pages
```

## Benefits of Feature-based Architecture

| Aspect                  | Type-based                                | Feature-based                 |
| ----------------------- | ----------------------------------------- | ----------------------------- |
| **Finding code**        | Need to look in multiple directories      | All related code in one place |
| **Adding features**     | Create files in 4-5 different directories | Create one feature folder     |
| **Understanding scope** | Unclear boundaries                        | Clear feature boundaries      |
| **Refactoring**         | High risk of side effects                 | Isolated changes              |
| **Team collaboration**  | Frequent merge conflicts                  | Teams can own features        |
| **Code removal**        | Hard to identify all related files        | Delete one folder             |

## Feature Modules

Each feature is a self-contained module with a consistent internal structure:

```
features/<feature-name>/
├── components/     # React components
├── hooks/          # Custom hooks
├── store/          # Redux slices
├── utils/          # Utility functions
├── contexts/       # React contexts (if needed)
├── providers/      # Context providers (if needed)
├── types/          # TypeScript types (if needed)
├── constants/      # Constants (if needed)
└── index.ts        # Public API exports
```

### Current Features

| Feature        | Description                    | Main Contents                                       |
| -------------- | ------------------------------ | --------------------------------------------------- |
| `auth`         | Authentication & authorization | AuthContext, AuthProvider, GuestRoute, PrivateRoute |
| `editor`       | Core markdown editor           | Editor, Preview, ToolBar, Yorkie integration        |
| `document`     | Document state & utilities     | documentSlice, ShareRole, soft line break utils     |
| `intelligence` | AI/LLM features                | YorkieIntelligence UI, hooks, CodeMirror extensions |
| `settings`     | App configuration              | configSlice (theme, vim mode), featureSettingSlice  |
| `user`         | User profile                   | userSlice                                           |
| `workspace`    | Workspace management           | workspaceSlice                                      |

### Feature Dependencies

Some features depend on others. Dependencies are **one-way only** (no circular dependencies).

```
intelligence ──▶ editor    (uses doc, cmView for AI content insertion)
intelligence ──▶ document  (uses addSoftLineBreak)
intelligence ──▶ settings  (uses selectFeatureSetting for feature flags)
editor ──▶ document        (uses ShareRole type)
editor ──▶ intelligence    (uses intelligencePivot extension)
```

> **Note**: `editor` owns the Yorkie `doc` and `client` instances. The `intelligence` feature accesses these through `selectEditor` to insert AI-generated content into the document. If collaboration features grow beyond the editor, consider extracting a `collaboration` feature.

## Decision Guide: Feature vs Shared

| Question                                    | If Yes → Feature | If No → Shared |
| ------------------------------------------- | ---------------- | -------------- |
| Is it used by only one feature?             | ✓                |                |
| Does it have feature-specific state?        | ✓                |                |
| Would removing the feature remove this too? | ✓                |                |
| Is it a generic UI component?               |                  | ✓              |
| Is it used across multiple features?        |                  | ✓              |
| Is it an API/data fetching hook?            |                  | ✓              |
