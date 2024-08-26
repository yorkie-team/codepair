import * as cmState from "@codemirror/state";
import * as cmView from "@codemirror/view";
import * as dom from "lib0/dom";
import * as pair from "lib0/pair";
import _ from "lodash";
import * as yorkie from "yorkie-js-sdk";
import {
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType,
	YorkieSyncConfig,
	yorkieSyncFacet,
} from "./yorkieSync.js";

export const yorkieRemoteSelectionsTheme = cmView.EditorView.baseTheme({
	".cm-ySelection": {},
	".cm-yLineSelection": {
		padding: 0,
		margin: "0px 2px 0px 4px",
	},
	".cm-ySelectionCaret": {
		position: "relative",
		borderLeft: "1px solid black",
		borderRight: "1px solid black",
		marginLeft: "-1px",
		marginRight: "-1px",
		boxSizing: "border-box",
		display: "inline",
	},
	".cm-ySelectionCaretDot": {
		borderRadius: "50%",
		position: "absolute",
		width: ".4em",
		height: ".4em",
		top: "-.2em",
		left: "-.2em",
		backgroundColor: "inherit",
		transition: "transform .3s ease-in-out",
		boxSizing: "border-box",
	},
	".cm-ySelectionCaret:hover > .cm-ySelectionCaretDot": {
		transformOrigin: "bottom center",
		transform: "scale(0)",
	},
	".cm-ySelectionInfo": {
		position: "absolute",
		top: "-1.05em",
		left: "-1px",
		fontSize: ".75em",
		fontFamily: "serif",
		fontStyle: "normal",
		fontWeight: "normal",
		lineHeight: "normal",
		userSelect: "none",
		color: "black",
		paddingLeft: "2px",
		paddingRight: "2px",
		zIndex: 101,
		transition: "opacity .3s ease-in-out",
		backgroundColor: "inherit",
		transitionDelay: "0s",
		whiteSpace: "nowrap",
	},
});

const yorkieRemoteSelectionsAnnotation: cmState.AnnotationType<Array<number>> =
	cmState.Annotation.define();

class YRemoteCaretWidget extends cmView.WidgetType {
	color: string;
	name: string;

	constructor(color: string, name: string) {
		super();
		this.color = color;
		this.name = name;
	}

	toDOM() {
		return dom.element(
			"span",
			[
				pair.create("class", "cm-ySelectionCaret"),
				pair.create(
					"style",
					`background-color: ${this.color}; border-color: ${this.color}`
				),
			],
			[
				dom.text("\u2060"),
				dom.element("div", [pair.create("class", "cm-ySelectionCaretDot")]),
				dom.text("\u2060"),
				dom.element(
					"div",
					[pair.create("class", "cm-ySelectionInfo")],
					[dom.text(this.name)]
				),
				dom.text("\u2060"),
			]
		) as HTMLElement;
	}

	eq(widget: YRemoteCaretWidget) {
		return widget.color === this.color;
	}

	compare(widget: YRemoteCaretWidget) {
		return widget.color === this.color;
	}

	updateDOM() {
		return false;
	}

	get estimatedHeight() {
		return -1;
	}

	ignoreEvent() {
		return true;
	}
}

export class YorkieRemoteSelectionsPluginValue {
	conf: YorkieSyncConfig<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;
	decorations: cmView.DecorationSet;
	unsubscribe: yorkie.Unsubscribe;

	constructor(view: cmView.EditorView) {
		this.conf = view.state.facet(yorkieSyncFacet);

		this.unsubscribe = this.conf.doc.subscribe("others", (event) => {
			if (["presence-changed", "unwatched"].includes(event.type)) {
				view.dispatch({ annotations: [yorkieRemoteSelectionsAnnotation.of([])] });
			}
		});
		this.decorations = cmState.RangeSet.of([]);
	}

	destroy() {
		this.unsubscribe();
	}

	update(update: cmView.ViewUpdate) {
		const decorations: Array<cmState.Range<cmView.Decoration>> = [];

		this.conf.doc.update((root, presence) => {
			const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus();
			const sel = hasFocus ? update.state.selection.main : null;

			if (sel && root.content) {
				const selection = root.content.indexRangeToPosRange([sel.anchor, sel.head]);
				const cursor = root.content.posRangeToIndexRange(selection);

				if (!_.isEqual(selection, presence.get("selection"))) {
					presence.set({
						selection,
						cursor,
					});
				}
			} else if (presence.get("selection")) {
				presence.set({
					selection: null,
					cursor: null,
				});
			}
		});

		this.conf.doc.getPresences().forEach((presence) => {
			if (presence.clientID === this.conf.client.getID()) {
				return;
			}
			if (presence.presence.selection == null) {
				return;
			}
			const cursor = this.conf.doc
				.getRoot()
				.content.posRangeToIndexRange(presence.presence.selection);
			const color = presence.presence.color;
			const name = presence.presence.name;
			const start = Math.min(cursor[0], cursor[1]);
			const end = Math.max(cursor[0], cursor[1]);
			const startLine = update.view.state.doc.lineAt(start);
			const endLine = update.view.state.doc.lineAt(end);
			if (startLine.number === endLine.number) {
				// selected content in a single line.
				decorations.push({
					from: start,
					to: end,
					value: cmView.Decoration.mark({
						attributes: { style: `background-color: ${color}` },
						class: "cm-ySelection",
					}),
				});
			} else {
				// selected content in multiple lines
				// first, render text-selection in the first line
				decorations.push({
					from: start,
					to: startLine.from + startLine.length,
					value: cmView.Decoration.mark({
						attributes: { style: `background-color: ${color}` },
						class: "cm-ySelection",
					}),
				});
				// render text-selection in the last line
				decorations.push({
					from: endLine.from,
					to: end,
					value: cmView.Decoration.mark({
						attributes: { style: `background-color: ${color}` },
						class: "cm-ySelection",
					}),
				});
				for (let i = startLine.number + 1; i < endLine.number; i++) {
					const linePos = update.view.state.doc.line(i).from;
					const linePosTo = update.view.state.doc.line(i).to;
					decorations.push({
						from: linePos,
						to: linePosTo,
						value: cmView.Decoration.mark({
							attributes: {
								style: `background-color: ${color}`,
								class: "cm-ySelection",
							},
						}),
					});
				}
			}
			decorations.push({
				from: cursor[0],
				to: cursor[0],
				value: cmView.Decoration.widget({
					side: cursor[0] - cursor[1] > 0 ? -1 : 1, // the local cursor should be rendered outside the remote selection
					block: false,
					widget: new YRemoteCaretWidget(color, name),
				}),
			});
		});
		this.decorations = cmView.Decoration.set(decorations, true);
	}
}

export const yorkieRemoteSelections = cmView.ViewPlugin.fromClass(
	YorkieRemoteSelectionsPluginValue,
	{
		decorations: (v) => v.decorations,
	}
);
