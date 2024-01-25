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
	_observer: yorkie.NextFn<yorkie.DocEvent<YorkieCodeMirrorPresenceType>>;
	_unsubscribe: yorkie.Unsubscribe;

	constructor(view: cmView.EditorView) {
		this.view = view;
		this.conf = view.state.facet(yorkieSyncFacet);

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
		this._unsubscribe = this._doc.subscribe("$.content", this._observer);
	}

	update(update: cmView.ViewUpdate) {
		if (
			!update.docChanged ||
			(update.transactions.length > 0 &&
				update.transactions[0].annotation(yorkieSyncAnnotation) === this.conf)
		) {
			return;
		}

		let adj = 0;
		this._doc.update((root, presence) => {
			update.changes.iterChanges((fromA, toA, _fromB, _toB, insert) => {
				if (!root.content) {
					root.content = new yorkie.Text();
				}
				const insertText = insert.sliceString(0, insert.length, "\n");
				const updatedIndexRange = root.content.edit(fromA + adj, toA + adj, insertText);
				adj += insertText.length - (toA - fromA);
				if (updatedIndexRange) {
					presence.set({
						selection: root.content.indexRangeToPosRange(updatedIndexRange),
					} as unknown as YorkieCodeMirrorPresenceType);
				}
			});
		});
	}

	destroy() {
		this._unsubscribe();
	}
}

export const yorkieSync = cmView.ViewPlugin.fromClass(YorkieSyncPluginValue);
