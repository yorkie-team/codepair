import * as cmState from "@codemirror/state"; // eslint-disable-line
import * as cmView from "@codemirror/view"; // eslint-disable-line
import * as yorkie from "yorkie-js-sdk";

export class YSyncConfig<T extends { content: yorkie.Text }, P extends { selection: any }> {
	doc: yorkie.Document<T, P>;
	client: yorkie.Client;
	constructor(doc: yorkie.Document<T, P>, client: yorkie.Client) {
		this.doc = doc;
		this.client = client;
	}
}

export const ySyncFacet: cmState.Facet<any, any> = cmState.Facet.define({
	combine(inputs) {
		return inputs[inputs.length - 1];
	},
});

export const yorkieSyncAnnotation: cmState.AnnotationType<any> = cmState.Annotation.define();

class YSyncPluginValue<T extends { content: yorkie.Text }, P extends { selection: any }>
	implements cmView.PluginValue
{
	view: cmView.EditorView;
	conf: YSyncConfig<T, P>;
	_doc: yorkie.Document<T, P>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_observer: yorkie.NextFn<yorkie.DocEvent<P, any>>;
	_unsubscribe: yorkie.Unsubscribe;

	constructor(view: cmView.EditorView) {
		this.view = view;
		this.conf = view.state.facet(ySyncFacet);

		// subscribe
		this._observer = (event) => {
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
						annotations: [yorkieSyncAnnotation.of(this.conf)],
					});
				}
			});
		};
		this._doc = this.conf.doc;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this._unsubscribe = this._doc.subscribe("$.content" as any, this._observer);
	}

	update(update: cmView.ViewUpdate) {
		if (
			!update.docChanged ||
			(update.transactions.length > 0 &&
				update.transactions[0].annotation(yorkieSyncAnnotation) === this.conf)
		) {
			return;
		}

		this._doc.update((root, presence) => {
			update.changes.iterChanges((fromA, toA, fromB, toB, insert) => {
				if (!root.content) {
					root.content = new yorkie.Text();
				}
				const insertText = insert.sliceString(0, insert.length, "\n");
				const updatedIndexRange = root.content.edit(fromA, toA, insertText);
				if (updatedIndexRange) {
					presence.set({
						selection: root.content.indexRangeToPosRange(updatedIndexRange),
					} as any);
				}
			});
		});
	}

	destroy() {
		this._unsubscribe();
	}
}

export const ySync = cmView.ViewPlugin.fromClass(YSyncPluginValue);
