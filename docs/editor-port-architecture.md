# EditorPort Architecture: Multi-Editor Monorepo

## Overview

CodePair's frontend has been refactored from a single monolithic package into a three-package pnpm workspace. This enables plugging in different editor implementations (e.g., a future `yorkie.Tree`-based rich text editor) alongside the existing CodeMirror markdown editor, without any coupling between them.

### The core constraint

CodeMirror uses `yorkie.Text` for real-time collaboration. Rich text editors use `yorkie.Tree`. These are **incompatible CRDTs** — they cannot share a sync layer. Each editor package must own its full vertical slice: editor UI, toolbar, preview, and CRDT synchronization.

## Package Structure

```
packages/
  ui/              @codepair/ui         — shared types, interfaces, pure components
  codemirror/      @codepair/codemirror  — CodeMirror 6 + yorkie.Text sync
  frontend/        @codepair/frontend    — app shell (routing, auth, workspace, editor slot)
  backend/         @codepair/backend     — NestJS API server
```

### Dependency graph

```
@codepair/ui            (depends on nothing)
       ^
       |
@codepair/codemirror    (depends on @codepair/ui)
       ^
       |
@codepair/frontend      (depends on @codepair/ui + @codepair/codemirror)
```

Dependencies flow strictly downward. Violations are caught by ESLint at lint time and CI.

## Key Concepts

### EditorPort — The editor abstraction

`EditorPort` is the interface that decouples the app shell from any specific editor. It lives in `@codepair/ui` so that both the app shell and editor packages can reference it without creating a circular dependency.

```typescript
// packages/ui/src/types/EditorPort.ts
export interface EditorPort {
  getSelection(): { from: number; to: number };
  replaceRange(
    from: number,
    to: number,
    insert: string,
    selection?: { anchor: number; head?: number },
  ): void;
  scrollIntoView(pos: number): void;
  getContentWidth(): number;
}
```

The app shell stores the active `EditorPort` in Redux (`editorSlice`). Features like "scroll to user cursor" in `UserPresenceList` or "export document" in `useFileExport` call methods on `EditorPort` without knowing which editor is running.

### EditorModeType — View layout modes

```typescript
// packages/ui/src/types/EditorModeType.ts
export enum EditorModeType {
  EDIT = "edit", // editor only
  BOTH = "both", // side-by-side editor + preview
  READ = "read", // preview only
}
```

Each editor suite component receives the current mode and renders itself accordingly.

### EditorSuiteProps — The shared props contract

`EditorSuiteProps` is a generic interface in `@codepair/ui` that defines the common props every editor suite component must accept. Each editor package extends this with implementation-specific props.

```typescript
// packages/ui/src/types/EditorSuiteProps.ts
export interface EditorSuiteProps<TDoc = unknown, TClient = unknown> {
  doc: TDoc;
  client: TClient;
  mode: EditorModeType;
  width: number | string;
  themeMode: "light" | "dark";
  codeKey?: CodeKeyType;
  onCodeKeyChange?: (key: CodeKeyType) => void;
  fileUploadEnabled: boolean;
  handleUploadImage: ((file: File) => Promise<string>) | null;
  intelligenceEnabled: boolean;
  intelligenceSlot?: React.ReactNode;
  onEditorPortChange?: (port: EditorPort | null) => void;
}
```

This ensures that the app shell can render any editor suite component with the same set of base props, while each editor is free to add its own extras (e.g., `disableScrollSync` for CodeMirror).

### CodeKeyType — Unified keybinding enum

`CodeKeyType` is a shared enum in `@codepair/ui` for keybinding presets:

```typescript
// packages/ui/src/types/CodeKeyType.ts
export enum CodeKeyType {
  DEFAULT = "default",
  VIM = "vim",
}
```

Previously, the codemirror package and the frontend settings each had their own `CodeKeyType` enum. These have been unified into `@codepair/ui` to avoid type mismatches across packages.

### CMEditorAdapter — The CodeMirror implementation

```typescript
// packages/codemirror/src/CMEditorAdapter.ts
export class CMEditorAdapter implements EditorPort {
  public readonly view: EditorView;
  // ...wraps CodeMirror EditorView into the EditorPort interface
}
```

Within `@codepair/codemirror`, code that needs the raw `EditorView` (e.g., toolbar formatting) accesses it through `CMEditorAdapter.view`. This cast never escapes the package boundary.

### EditorSuite (CMEditorSuite) — The composite entry point

`CMEditorSuite` is the CodeMirror editor suite component. It is exported as `EditorSuite` from `@codepair/codemirror` so that the app shell uses editor-agnostic import names. It encapsulates:

- **Editor** — CodeMirror instance with yorkie.Text sync, image upload, vim mode
- **Preview** — Markdown rendering with incremental-dom
- **ToolBar** — Formatting buttons (bold, italic, headings, etc.)
- **EditorBottomBar** — Keymap selector (default / vim)
- **Layout** — Resizable split pane, scroll sync, mode switching

```
App Shell (DocumentView)
  |
  +-- <EditorSuite
  |       doc={yorkieDoc}
  |       client={yorkieClient}
  |       mode={EDIT | BOTH | READ}
  |       codeKey={configStore.codeKey}
  |       onCodeKeyChange={handleCodeKeyChange}
  |       onEditorPortChange={port => dispatch(setEditorPort(port))}
  |       intelligenceSlot={<YorkieIntelligence />}
  |       ...
  |   />
  |
  +-- <ModeSwitcher />
```

Props instead of Redux: inside `@codepair/codemirror`, components use `CMEditorContext` (React Context) instead of Redux selectors. The context is provided by `CMEditorSuite` and populated from the props the app shell passes in.

### The intelligenceSlot pattern

The intelligence feature (AI-powered editing) lives in the app shell (`features/intelligence/`), not in the codemirror package. To avoid a reverse dependency, the editor suite accepts an `intelligenceSlot` prop (defined in `EditorSuiteProps`):

```tsx
// App shell
<EditorSuite
  intelligenceSlot={<YorkieIntelligence />}
  intelligenceEnabled={true}
/>
```

The codemirror package renders the slot without knowing anything about the intelligence implementation.

## How the App Shell Works

### Data flow

```
Page component (document/Index.tsx)
  |
  | creates Yorkie client + document via useYorkieDocument()
  | dispatches setDoc(doc), setClient(client) to Redux
  |
  v
DocumentView
  |
  | reads editorStore.doc, editorStore.client from Redux
  | reads settings (theme, codeKey, fileUpload, intelligence)
  | passes everything as props to EditorSuite
  |
  v
EditorSuite (CMEditorSuite in @codepair/codemirror)
  |
  | creates CMEditorAdapter when CodeMirror initializes
  | calls onEditorPortChange(adapter) to register with app shell
  |
  v
editorSlice.editorPort = adapter
  |
  | app shell features (UserPresenceList, useFileExport, etc.)
  | call editorPort.scrollIntoView(), editorPort.getSelection(), etc.
```

### Redux state (editorSlice)

```typescript
interface EditorState {
  mode: EditorModeType; // from @codepair/ui
  shareRole: ShareRole | null; // viewer/editor/null
  doc: CodePairDocType | null; // Yorkie document (from @codepair/codemirror)
  client: yorkie.Client | null; // Yorkie client
  editorPort: EditorPort | null; // from @codepair/ui
}
```

The slice imports the `CodePairDocType` from `@codepair/codemirror` because the current editor uses `yorkie.Text`. When a second editor is added, the doc type in Redux will need to become a union or the state will need to be restructured.

## Dependency Boundaries

ESLint `no-restricted-imports` rules enforce the architecture at lint time:

| Package                | Banned imports                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `@codepair/ui`         | `codemirror`, `@codemirror/*`, `@replit/*`, `@yorkie-js/*`, `@codepair/codemirror`, `@codepair/frontend` |
| `@codepair/codemirror` | `@codepair/frontend`                                                                                     |
| `@codepair/frontend`   | `codemirror`, `@codemirror/*`, `@replit/*`                                                               |

The CI pipeline (`ci_frontend.yaml`) runs lint for all three packages, so violations block merging.

## Build Strategy

No separate build step for library packages. Vite resolves `workspace:*` packages directly from source via `"main": "src/index.ts"` in each package.json. Only `@codepair/frontend` has a build step (Vite bundle for production). TypeScript type-checking runs per-package via `tsc --noEmit`.

## How to Add a New Editor

This section walks through adding a hypothetical `@codepair/smart-editor` package that uses `yorkie.Tree` for rich text editing.

### Step 1: Scaffold the package

```
packages/smart-editor/
  package.json
  tsconfig.json
  eslint.config.mjs
  .prettierrc
  src/
    index.ts
```

**`package.json`**:

```json
{
  "name": "@codepair/smart-editor",
  "version": "0.2.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@codepair/ui": "workspace:*",
    "@yorkie-js/sdk": "..."
  }
}
```

**`eslint.config.mjs`** — add boundary rule:

```javascript
"no-restricted-imports": ["error", {
    patterns: ["@codepair/frontend", "@codepair/codemirror"]
}]
```

Update `pnpm-workspace.yaml` (already includes `packages/*`, so no change needed).

### Step 2: Define the document type

```typescript
// packages/smart-editor/src/types.ts
import * as yorkie from "@yorkie-js/sdk";

// yorkie.Tree types for rich text
export type SmartEditorDocType = yorkie.Document<
  { content: yorkie.Tree },
  { name: string; color: string; cursor: unknown }
>;
```

### Step 3: Implement the EditorPort adapter

```typescript
// packages/smart-editor/src/SmartEditorAdapter.ts
import type { EditorPort } from "@codepair/ui";

export class SmartEditorAdapter implements EditorPort {
  private editor: YourEditorInstance;

  constructor(editor: YourEditorInstance) {
    this.editor = editor;
  }

  getSelection() {
    // Map your editor's selection model to { from, to }
  }

  replaceRange(from: number, to: number, insert: string, selection?) {
    // Map to your editor's editing API
  }

  scrollIntoView(pos: number) {
    // Map to your editor's scroll API
  }

  getContentWidth() {
    return this.editor.dom.getBoundingClientRect().width;
  }
}
```

### Step 4: Create the suite component

Extend `EditorSuiteProps` from `@codepair/ui` with your editor's specific doc/client types and any extra props:

```typescript
// packages/smart-editor/src/SmartEditorSuite.tsx
import type { EditorSuiteProps } from "@codepair/ui";

export interface SmartEditorSuiteProps extends EditorSuiteProps<
  SmartEditorDocType,
  yorkie.Client
> {
  // ...any editor-specific extra props
}

function SmartEditorSuite(props: SmartEditorSuiteProps) {
  // 1. Create internal context (like CMEditorContext)
  // 2. Initialize your editor, create SmartEditorAdapter
  // 3. Call onEditorPortChange(adapter) when ready
  // 4. Render editor + toolbar + preview based on mode
  // 5. Handle yorkie.Tree sync internally
}
```

### Step 5: Export from the barrel

Export the suite component as `EditorSuite` (not the internal class name) so the app shell can use the same import name regardless of which editor package is resolved:

```typescript
// packages/smart-editor/src/index.ts
export { default as EditorSuite } from "./SmartEditorSuite";
export type { SmartEditorSuiteProps } from "./SmartEditorSuite";
export { SmartEditorAdapter as EditorAdapter } from "./SmartEditorAdapter";
export type { SmartEditorDocType } from "./types";
```

### Step 6: Wire into the app shell

Add the dependency to the frontend:

```json
// packages/frontend/package.json
"dependencies": {
    "@codepair/smart-editor": "workspace:*"
}
```

Update `DocumentView.tsx` to select which editor to render. Because both packages export `EditorSuite`, you use import aliases:

```typescript
import { EditorSuite as CMEditorSuite } from "@codepair/codemirror";
import { EditorSuite as SmartEditorSuite } from "@codepair/smart-editor";

function DocumentView() {
    const editorType = useEditorType(); // determine from doc metadata or config

    if (editorType === "smart") {
        return <SmartEditorSuite doc={...} onEditorPortChange={...} />;
    }

    return <CMEditorSuite doc={...} onEditorPortChange={...} />;
}
```

Alternatively, if your deployment uses only one editor package (e.g., swapped via `.pnpmfile.cjs`), no alias is needed — just `import { EditorSuite } from "@codepair/codemirror"`.

The rest of the app shell (user presence, file export, header, mode switcher) continues to work unchanged — it only interacts through `EditorPort`.

### Step 7: Update ESLint boundary in frontend

```javascript
// packages/frontend/eslint.config.mjs
"no-restricted-imports": ["error", {
    paths: ["codemirror"],
    patterns: ["@codemirror/*", "@replit/*"]
    // Note: do NOT add smart-editor internals here
}]
```

### Step 8: Update CI

Add to `ci_frontend.yaml`:

```yaml
- name: Lint SmartEditor
  run: pnpm --filter=@codepair/smart-editor lint
```

### Checklist

- [ ] Package scaffolded with `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`
- [ ] Document type defined with appropriate Yorkie CRDT (`yorkie.Tree`)
- [ ] `EditorPort` implemented in an adapter class
- [ ] Suite component's props interface extends `EditorSuiteProps` from `@codepair/ui`
- [ ] `onEditorPortChange` callback wired to register the adapter
- [ ] `intelligenceSlot` prop accepted and rendered (if intelligence is supported)
- [ ] Barrel `index.ts` exports the suite as `EditorSuite`, adapter as `EditorAdapter`, and types
- [ ] ESLint boundary rule bans `@codepair/frontend` and other editor packages
- [ ] `pnpm --filter=@codepair/smart-editor typecheck` passes
- [ ] `pnpm --filter=@codepair/frontend build` passes
- [ ] CI updated to lint the new package

## File Reference

| File                                                                       | Purpose                                                                       |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/ui/src/types/EditorPort.ts`                                      | The interface every editor adapter must implement                             |
| `packages/ui/src/types/EditorModeType.ts`                                  | EDIT / BOTH / READ enum                                                       |
| `packages/ui/src/types/EditorSuiteProps.ts`                                | Shared props contract for all editor suite components                         |
| `packages/ui/src/types/CodeKeyType.ts`                                     | Unified keybinding preset enum (DEFAULT / VIM)                                |
| `packages/ui/src/types/PresenceInfo.ts`                                    | Editor-agnostic presence data                                                 |
| `packages/codemirror/src/CMEditorSuite.tsx`                                | CodeMirror composite entry point (exported as `EditorSuite`)                  |
| `packages/codemirror/src/CMEditorAdapter.ts`                               | CodeMirror's EditorPort implementation (exported as `EditorAdapter`)          |
| `packages/codemirror/src/CMEditorContext.tsx`                              | Internal React Context (replaces Redux inside the package)                    |
| `packages/codemirror/src/types.ts`                                         | `CodePairDocType` (yorkie.Text), re-exports `CodeKeyType` from `@codepair/ui` |
| `packages/codemirror/src/plugins/yorkie/`                                  | Yorkie sync and remote selection CM plugins                                   |
| `packages/frontend/src/features/editor/store/editorSlice.ts`               | Redux state holding mode, doc, client, editorPort                             |
| `packages/frontend/src/features/editor/shared/components/DocumentView.tsx` | App shell component that renders EditorSuite                                  |
| `packages/frontend/src/providers/CollaborationProvider.tsx`                | React Context for Yorkie doc/client (prepared for future use)                 |
