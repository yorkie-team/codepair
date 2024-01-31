import * as cmView from "@codemirror/view";

import * as cmState from "@codemirror/state";
import * as dom from "lib0/dom";
import * as pair from "lib0/pair";
import { INTELLIGENCE_FOOTER_ID, INTELLIGENCE_HEADER_ID } from "../../constants/intelligence";

class IntelligencePivotWidget extends cmView.WidgetType {
	id: string;
	selectionRange: cmState.SelectionRange | null;

	constructor(id: string, selectionRange: cmState.SelectionRange | null) {
		super();
		this.id = id;
		this.selectionRange = selectionRange;
	}

	toDOM() {
		return dom.element("span", [
			pair.create("id", this.id),
			pair.create("style", `position: relaitve;`),
		]) as HTMLElement;
	}

	eq(widget: IntelligencePivotWidget) {
		return widget.selectionRange === this.selectionRange;
	}

	compare(widget: IntelligencePivotWidget) {
		return widget.selectionRange === this.selectionRange;
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

export class IntelligencePivotPluginValue {
	decorations: cmView.DecorationSet;

	constructor() {
		this.decorations = cmState.RangeSet.of([]);
	}

	update(update: cmView.ViewUpdate) {
		const decorations: Array<cmState.Range<cmView.Decoration>> = [];
		const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus();
		const selectionRange = hasFocus ? update.state.selection.main : null;
		const isDragged = Boolean(selectionRange && selectionRange?.from !== selectionRange?.to);

		if (isDragged && selectionRange) {
			decorations.push({
				from: selectionRange.from,
				to: selectionRange.from,
				value: cmView.Decoration.widget({
					side: 1, // the local cursor should be rendered outside the remote selection
					block: false,
					widget: new IntelligencePivotWidget(INTELLIGENCE_HEADER_ID, selectionRange),
				}),
			});

			decorations.push({
				from: selectionRange.to,
				to: selectionRange.to,
				value: cmView.Decoration.widget({
					side: 1, // the local cursor should be rendered outside the remote selection
					block: false,
					widget: new IntelligencePivotWidget(INTELLIGENCE_FOOTER_ID, selectionRange),
				}),
			});
		}

		this.decorations = cmView.Decoration.set(decorations, true);
	}
}

export const intelligencePivot = cmView.ViewPlugin.fromClass(IntelligencePivotPluginValue, {
	decorations: (v) => v.decorations,
});
