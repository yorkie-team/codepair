import { useCallback, useState } from "react";
import { FormatType, ToolBarState, useFormatUtils } from "./useFormatUtils";
import { ViewUpdate } from "@codemirror/view";

export const useToolBar = () => {
	const [toolBarState, setToolBarState] = useState<ToolBarState>({
		show: false,
		position: { top: 0, left: 0 },
		selectedFormats: new Set<FormatType>(),
	});
	const { getFormatMarkerLength, checkAndAddFormat } = useFormatUtils();

	const updateFormatBar = useCallback(
		(update: ViewUpdate) => {
			const { state, view } = update;
			const selection = state.selection.main;

			if (selection.empty) {
				setToolBarState((prev) => ({
					...prev,
					show: false,
					selectedFormats: new Set(),
				}));
				return;
			}

			const coords = view.coordsAtPos(selection.from);
			if (!coords) return;

			const maxLength = getFormatMarkerLength(view.state, selection.from);
			const selectedTextStart = state.sliceDoc(selection.from - maxLength, selection.from);
			const selectedTextEnd = state.sliceDoc(selection.to, selection.to + maxLength);
			const formats = new Set<FormatType>();
			const formatChecks = [
				{ marker: "**", format: FormatType.BOLD },
				{ marker: "_", format: FormatType.ITALIC },
				{ marker: "`", format: FormatType.CODE },
				{ marker: "~~", format: FormatType.STRIKETHROUGH },
			];

			formatChecks.forEach(({ marker, format }) => {
				checkAndAddFormat(selectedTextStart, selectedTextEnd, marker, format, formats);
			});

			// TODO: Modify the rendering method so that it is not affected by the size of the Toolbar
			setToolBarState((prev) => ({
				...prev,
				show: true,
				position: {
					top: coords.top - 5,
					left: coords.left,
				},
				selectedFormats: formats,
			}));
		},
		[getFormatMarkerLength, checkAndAddFormat]
	);

	return { toolBarState, setToolBarState, updateFormatBar };
};
