import { useCallback, useState } from "react";
import { FormatType, ToolBarState, useFormatUtils } from "./useFormatUtils";
import { ViewUpdate } from "@codemirror/view";

export const useToolBar = () => {
	const [toolBarState, setToolBarState] = useState<ToolBarState>({
		show: false,
		position: { top: 0, left: 0 },
		selectedFormats: new Set<FormatType>(),
	});
	const { getFormatMarkerLength } = useFormatUtils();

	const updateFormatBar = useCallback(
		(update: ViewUpdate) => {
			const selection = update.state.selection.main;
			if (!selection.empty) {
				const coords = update.view.coordsAtPos(selection.from);
				if (coords) {
					const maxLength = getFormatMarkerLength(update.view.state, selection.from);

					const selectedTextStart = update.state.sliceDoc(
						selection.from - maxLength,
						selection.from
					);
					const selectedTextEnd = update.state.sliceDoc(
						selection.to,
						selection.to + maxLength
					);
					const formats = new Set<FormatType>();

					const checkAndAddFormat = (marker: string, format: FormatType) => {
						if (
							selectedTextStart.includes(marker) &&
							selectedTextEnd.includes(marker)
						) {
							formats.add(format);
						}
					};

					checkAndAddFormat("**", FormatType.BOLD);
					checkAndAddFormat("_", FormatType.ITALIC);
					checkAndAddFormat("`", FormatType.CODE);
					checkAndAddFormat("~~", FormatType.STRIKETHROUGH);

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
				}
			} else {
				setToolBarState((prev) => ({
					...prev,
					show: false,
					selectedFormats: new Set(),
				}));
			}
		},
		[getFormatMarkerLength]
	);

	return { toolBarState, setToolBarState, updateFormatBar };
};
