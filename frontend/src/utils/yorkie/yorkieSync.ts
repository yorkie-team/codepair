import * as cmState from "@codemirror/state";
import * as cmView from "@codemirror/view";
import * as yorkie from "yorkie-js-sdk";

export type YorkieCodeMirrorDocType = {
	content: yorkie.Text<yorkie.Indexable>;
};

export type YorkieCodeMirrorPresenceType = {
	color: string;
	name: string;
	selection: yorkie.TextPosStructRange | null;
	cursor: [number, number] | null;
};

export class YorkieSyncConfig<
	T extends YorkieCodeMirrorDocType,
	P extends YorkieCodeMirrorPresenceType,
> {
	doc: yorkie.Document<T, P>;
	client: yorkie.Client;
	constructor(doc: yorkie.Document<T, P>, client: yorkie.Client) {
		this.doc = doc;
		this.client = client;
	}
}

export const yorkieSyncFacet: cmState.Facet<
	YorkieSyncConfig<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>,
	YorkieSyncConfig<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>
> = cmState.Facet.define({
	combine(inputs) {
		return inputs[inputs.length - 1];
	},
});

export const yorkieSyncAnnotation: cmState.AnnotationType<
	YorkieSyncConfig<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>
> = cmState.Annotation.define();

class YorkieSyncPluginValue implements cmView.PluginValue {
	view: cmView.EditorView;
	conf: YorkieSyncConfig<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;
	_doc: yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;

	constructor(view: cmView.EditorView) {
		this.view = view;
		this.conf = view.state.facet(yorkieSyncFacet);
		this._doc = this.conf.doc;

		this._doc.subscribe((event) => {
			if (event.type !== "snapshot") return;

			// The text is replaced to snapshot and must be re-synced.
			const text = this._doc.getRoot().content;
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: text.toString() },
				annotations: [cmState.Transaction.remote.of(true)],
			});
		});

		this._doc.update((root) => {
			if (root.content) return;
			root.content = new yorkie.Text();
		});

		this._doc.subscribe("$.content", (event) => {
			if (event.type !== "remote-change") return;

			const { operations } = event.value;

			operations.forEach((op) => {
				if (op.type === "edit") {
					const changes = [
						{
							from: Math.max(0, op.from),
							to: Math.max(0, op.to),
							insert: op.value!.content,
						},
					];

					view.dispatch({
						changes,
						annotations: [cmState.Transaction.remote.of(true)],
					});
				}
			});
		});
	}

	update(update: cmView.ViewUpdate) {
		if (update.docChanged) {
			for (const tr of update.transactions) {
				const events = ["select", "input", "delete", "move", "undo", "redo"];
				if (!events.some((event) => tr.isUserEvent(event))) {
					continue;
				}
				if (tr.annotation(cmState.Transaction.remote)) {
					continue;
				}
				let adj = 0;
				this._doc.update((root) => {
					tr.changes.iterChanges((fromA, toA, _, __, inserted) => {
						const insertText = inserted.toJSON().join("\n");
						root.content.edit(fromA + adj, toA + adj, insertText);
						adj += insertText.length - (toA - fromA);
					});
				});
			}
		}
	}
}

export const yorkieSync = cmView.ViewPlugin.fromClass(YorkieSyncPluginValue);
