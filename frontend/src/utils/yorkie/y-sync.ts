import * as Y from "yjs";
import * as cmState from "@codemirror/state"; // eslint-disable-line
import * as cmView from "@codemirror/view"; // eslint-disable-line
import { YRange } from "./y-range.js";
import * as yorkie from "yorkie-js-sdk";

export class YSyncConfig {
	doc: yorkie.Document;
	constructor(doc, awareness) {
		this.doc = doc;
		this.awareness = awareness;
	}

	/**
	 * Helper function to transform an absolute index position to a Yjs-based relative position
	 * (https://docs.yjs.dev/api/relative-positions).
	 *
	 * A relative position can be transformed back to an absolute position even after the document has changed. The position is
	 * automatically adapted. This does not require any position transformations. Relative positions are computed based on
	 * the internal Yjs document model. Peers that share content through Yjs are guaranteed that their positions will always
	 * synced up when using relatve positions.
	 *
	 * ```js
	 * import { ySyncFacet } from 'y-codemirror'
	 *
	 * ..
	 * const ysync = view.state.facet(ySyncFacet)
	 * // transform an absolute index position to a ypos
	 * const ypos = ysync.getYPos(3)
	 * // transform the ypos back to an absolute position
	 * ysync.fromYPos(ypos) // => 3
	 * ```
	 *
	 * It cannot be guaranteed that absolute index positions can be synced up between peers.
	 * This might lead to undesired behavior when implementing features that require that all peers see the
	 * same marked range (e.g. a comment plugin).
	 *
	 * @param {number} pos
	 * @param {number} [assoc]
	 */
	toYPos(pos, assoc = 0) {
		return Y.createRelativePositionFromTypeIndex(this.ytext, pos, assoc);
	}

	/**
	 * @param {Y.RelativePosition | Object} rpos
	 */
	fromYPos(rpos) {
		const pos = Y.createAbsolutePositionFromRelativePosition(
			Y.createRelativePositionFromJSON(rpos),
			this.ytext.doc
		);
		if (pos == null || pos.type !== this.ytext) {
			throw new Error(
				"[y-codemirror] The position you want to retrieve was created by a different document"
			);
		}
		return {
			pos: pos.index,
			assoc: pos.assoc,
		};
	}

	/**
	 * @param {cmState.SelectionRange} range
	 * @return {YRange}
	 */
	toYRange(range) {
		const assoc = range.assoc;
		const yanchor = this.toYPos(range.anchor, assoc);
		const yhead = this.toYPos(range.head, assoc);
		return new YRange(yanchor, yhead);
	}

	/**
	 * @param {YRange} yrange
	 */
	fromYRange(yrange) {
		const anchor = this.fromYPos(yrange.yanchor);
		const head = this.fromYPos(yrange.yhead);
		if (anchor.pos === head.pos) {
			return cmState.EditorSelection.cursor(head.pos, head.assoc);
		}
		return cmState.EditorSelection.range(anchor.pos, head.pos);
	}
}

export const ySyncFacet: cmState.Facet<YSyncConfig, YSyncConfig> = cmState.Facet.define({
	combine(inputs) {
		return inputs[inputs.length - 1];
	},
});

export const yorkieSyncAnnotation: cmState.AnnotationType<YSyncConfig> =
	cmState.Annotation.define();

class YSyncPluginValue<T extends { content: yorkie.Text }, P extends { selection: any }>
	implements cmView.PluginValue
{
	view: cmView.EditorView;
	conf: YSyncConfig;
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
						annotations: [cmState.Transaction.remote.of(true)],
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
