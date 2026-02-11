import * as cmView from "@codemirror/view";
import * as cmState from "@codemirror/state";
import * as dom from "lib0/dom";
import * as pair from "lib0/pair";

const INTELLIGENCE_HEADER_ID = "yorkie-intelligence-header";
const INTELLIGENCE_FOOTER_ID = "yorkie-intelligence-footer";

class IntelligencePivotWidget extends cmView.WidgetType {
	id: string;
	content: string;
	selectionRange: cmState.SelectionRange | null;

	constructor(id: string, content: string, selectionRange: cmState.SelectionRange | null) {
		super();
		this.id = id;
		this.content = content;
		this.selectionRange = selectionRange;
	}

	toDOM() {
		return dom.element("span", [
			pair.create("id", this.id),
			pair.create("content", this.content),
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
		const selectionRange = update.state.selection.main;
		const isDragged = selectionRange?.from !== selectionRange?.to;

		if (isDragged && selectionRange) {
			const selectedContent = update.state.sliceDoc(selectionRange.from, selectionRange.to);
			decorations.push({
				from: selectionRange.from,
				to: selectionRange.from,
				value: cmView.Decoration.widget({
					side: 1,
					block: false,
					widget: new IntelligencePivotWidget(
						INTELLIGENCE_HEADER_ID,
						selectedContent,
						selectionRange
					),
				}),
			});

			decorations.push({
				from: selectionRange.to,
				to: selectionRange.to,
				value: cmView.Decoration.widget({
					side: 1,
					block: false,
					widget: new IntelligencePivotWidget(
						INTELLIGENCE_FOOTER_ID,
						selectedContent,
						selectionRange
					),
				}),
			});
		}

		this.decorations = cmView.Decoration.set(decorations, true);
	}
}

export const intelligencePivot = cmView.ViewPlugin.fromClass(IntelligencePivotPluginValue, {
	decorations: (v) => v.decorations,
});
