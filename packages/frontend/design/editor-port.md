# EditorPort Interface

This document describes the `EditorPort` abstraction layer introduced to decouple external consumers from the CodeMirror editor implementation.

## Motivation

The feature-based architecture documented in [architecture.md](./architecture.md) promises swappable implementations — adding a new editor (e.g., ProseMirror, Monaco) should only require creating a new subdirectory alongside `codemirror/`. In practice, several violations existed:

| Location                                                | Violation                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `store/editorSlice.ts`                                  | Stored `EditorView` directly, importing from `"codemirror"`         |
| `intelligence/components/YorkieIntelligenceFeature.tsx` | Called `cmView.dispatch()` and `doc.update()` directly (dual-write) |
| `intelligence/components/YorkieIntelligenceFooter.tsx`  | Accessed `cmView.contentDOM.getBoundingClientRect()`                |
| `components/headers/UserPresenceList.tsx`               | Imported `EditorView` from `"codemirror"` for scroll dispatch       |
| `codemirror/hooks/useSpeechToText.ts`                   | Dual-wrote to both `doc.update()` and `cmView.dispatch()`           |

These couplings meant that replacing CodeMirror would require changes across features and shared components — exactly what the architecture is designed to prevent.

## Design

### Approach: Thin Data-Plane Interface

We introduce an `EditorPort` interface that covers the **data plane only** — text operations, selection, and scroll. CodeMirror-specific concerns (sync plugins, decorations, format commands, keymaps) stay untouched inside `codemirror/`.

The interface was derived by auditing the 3 external consumers (intelligence feature, speech-to-text, user presence list) and extracting only the operations they actually use.

### Alternative Considered: Full Editor Abstraction

A full abstraction covering formatting, extensions, and document lifecycle was considered and rejected. The format toolbar, image uploader, and URL hyperlink inserter are deeply tied to CodeMirror's transaction model and extension system. Abstracting these would add complexity without clear benefit — they naturally live inside `codemirror/` and would be reimplemented per-editor anyway.

## Interface

```
packages/ui/src/types/EditorPort.ts
```

```typescript
export interface EditorPort {
	getSelection(): { from: number; to: number };
	replaceRange(
		from: number,
		to: number,
		insert: string,
		selection?: { anchor: number; head?: number }
	): void;
	scrollIntoView(pos: number): void;
	getContentWidth(): number;
}
```

| Method              | Purpose                                           | Used by                      |
| ------------------- | ------------------------------------------------- | ---------------------------- |
| `getSelection()`    | Get normalized (from <= to) selection range       | Intelligence, Speech-to-text |
| `replaceRange()`    | Replace text range with optional cursor placement | Intelligence, Speech-to-text |
| `scrollIntoView()`  | Scroll editor to a document position              | UserPresenceList             |
| `getContentWidth()` | Get editor content area width for UI sizing       | Intelligence footer          |

## Adapter

```
packages/codemirror/src/CMEditorAdapter.ts
```

The `CMEditorAdapter` implements `EditorPort` and wraps an `EditorView`:

- Exposes `readonly view: EditorView` so CM-internal code (e.g., `useFormatUtils`) can still access the raw view when needed via a cast
- `replaceRange()` annotates transactions with `Transaction.userEvent.of("input")`, which triggers both the `yorkieSync` plugin (content sync) and `remoteSelection` plugin (presence sync) automatically

### Eliminating Dual-Write

Before this change, external consumers had to manually write to both Yorkie and CodeMirror:

```typescript
// Before: manual dual-write in YorkieIntelligenceFeature
editorStore.doc?.update((root, presence) => {
  root.content.edit(from, to, insert);
  presence.set({
    selection: root.content.indexRangeToPosRange([...]),
  });
});
editorStore.cmView?.dispatch({
  changes: { from, to, insert },
  selection: { anchor, head },
});
```

After this change, a single call through `EditorPort` is sufficient:

```typescript
// After: single call, yorkieSync handles Yorkie content sync
editorStore.editorPort.replaceRange(from, to, insert, { anchor, head });
```

This works because `CMEditorAdapter.replaceRange()` annotates the transaction with `Transaction.userEvent.of("input")`. The `yorkieSync` plugin's `update()` method checks for this annotation and applies the corresponding edit to the Yorkie document. The `remoteSelection` plugin similarly picks up the selection change.

## File Structure

```
packages/ui/src/types/
└── EditorPort.ts                  # Editor-agnostic interface

packages/codemirror/src/
├── CMEditorAdapter.ts             # CodeMirror implementation of EditorPort
├── components/
│   └── Editor.tsx                 # Creates adapter, dispatches setEditorPort
├── hooks/
│   ├── useFormatUtils.ts          # Casts to CMEditorAdapter for CM-specific ops
│   └── useSpeechToText.ts         # Uses EditorPort (no more dual-write)
└── utils/

packages/frontend/src/features/editor/
├── store/
│   └── editorSlice.ts             # Stores EditorPort (not EditorView)
└── index.ts                       # Exports setEditorPort, EditorPort type
```

## Redux State Change

| Before                                    | After                                         |
| ----------------------------------------- | --------------------------------------------- |
| `state.editor.cmView: EditorView \| null` | `state.editor.editorPort: EditorPort \| null` |
| `setCmView` action                        | `setEditorPort` action                        |

The serialization and immutability checks in `store.ts` are updated accordingly.

## Import Boundary

After this change, `"codemirror"` and `"@codemirror"` imports only appear in:

- `packages/codemirror/**` — the self-contained CodeMirror package

No other package, feature, shared component, or page imports from CodeMirror directly. The `intelligencePivot` CM extension has also been moved into `@codepair/codemirror`.

## Adding a New Editor

To add a new editor (e.g., ProseMirror), you would:

1. Create `packages/prosemirror/` as a new package with its own components, hooks, and utils
2. Create `PMEditorAdapter.ts` implementing `EditorPort`
3. Call `onEditorPortChange(new PMEditorAdapter(...))` from the ProseMirror editor component
4. Wire the new editor into the frontend app shell via `DocumentView`

All external consumers (intelligence, presence, speech-to-text) work unchanged. See [`docs/editor-port-architecture.md`](../../../docs/editor-port-architecture.md) for the full step-by-step guide.

## Out of Scope

The following items are intentionally left for follow-up work:

- **`imageUploader.ts` / `urlHyperlinkInserter.ts`**: CM plugins that receive `view` from CM's event system; they still dual-write internally but are already inside `@codepair/codemirror`
- ~~**`intelligencePivot.ts`**: Moved to `@codepair/codemirror` — completed~~
- ~~**Extracting `codemirror/` as an external package**: Completed — now `@codepair/codemirror`~~
- **Renaming `YorkieCodeMirrorDocType`**: Making the Yorkie document type name editor-agnostic
