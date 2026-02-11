import { Transaction } from "@codemirror/state";
import { EditorView } from "codemirror";
import { EditorPort } from "../port/EditorPort";

export class CMEditorAdapter implements EditorPort {
	public readonly view: EditorView;

	constructor(view: EditorView) {
		this.view = view;
	}

	getSelection(): { from: number; to: number } {
		const sel = this.view.state.selection.main;
		return {
			from: Math.min(sel.from, sel.to),
			to: Math.max(sel.from, sel.to),
		};
	}

	replaceRange(
		from: number,
		to: number,
		insert: string,
		selection?: { anchor: number; head?: number }
	): void {
		this.view.dispatch({
			changes: { from, to, insert },
			...(selection ? { selection } : {}),
			annotations: Transaction.userEvent.of("input"),
		});
	}

	scrollIntoView(pos: number): void {
		this.view.dispatch({
			effects: EditorView.scrollIntoView(pos, { y: "center" }),
		});
	}

	getContentWidth(): number {
		return this.view.contentDOM.getBoundingClientRect().width;
	}
}
