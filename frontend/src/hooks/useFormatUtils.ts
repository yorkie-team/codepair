import { MouseEvent, useCallback } from "react";
import { EditorState, Text, EditorSelection, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { selectEditor } from "../store/editorSlice";

export interface ToolBarState {
	show: boolean;
	position: { top: number; left: number };
	selectedFormats: Set<FormatType>;
}

export enum FormatType {
	BOLD = "bold",
	ITALIC = "italic",
	CODE = "code",
	STRIKETHROUGH = "strikeThrough",
}

export const useFormatUtils = () => {
	const { cmView } = useSelector(selectEditor);

	const getFormatMarker = useCallback((formatType: FormatType) => {
		switch (formatType) {
			case FormatType.BOLD:
				return "**";
			case FormatType.ITALIC:
				return "_";
			case FormatType.CODE:
				return "`";
			case FormatType.STRIKETHROUGH:
				return "~~";
		}
	}, []);

	const getFormatMarkerLength = useCallback((state: EditorState, from: number) => {
		const maxCheckLength = 10;

		const markerSet = new Set(["*", "_", "`", "~"]);
		const docSlice = state.sliceDoc(Math.max(0, from - maxCheckLength), from);
		return [...docSlice].reduce((acc, c) => (markerSet.has(c) ? acc + 1 : acc), 0);
	}, []);

	const applyFormat = useCallback(
		(formatType: FormatType) => {
			const marker = getFormatMarker(formatType);
			const markerLength = marker.length;

			return ({ state, dispatch }: EditorView) => {
				const changes = state.changeByRange((range) => {
					const maxLength = getFormatMarkerLength(state, range.from);
					const beforeIdx = state
						.sliceDoc(
							range.from - maxLength < 0 ? 0 : range.from - maxLength,
							range.from
						)
						.indexOf(marker);
					const afterIdx = state.sliceDoc(range.to, range.to + maxLength).indexOf(marker);

					const changes = [
						beforeIdx === -1
							? {
									from: range.from,
									insert: Text.of([marker]),
								}
							: {
									from: range.from - maxLength + beforeIdx,
									to: range.from - maxLength + beforeIdx + markerLength,
									insert: Text.of([""]),
								},

						afterIdx === -1
							? {
									from: range.to,
									insert: Text.of([marker]),
								}
							: {
									from: range.to + afterIdx,
									to: range.to + afterIdx + markerLength,
									insert: Text.of([""]),
								},
					];

					const extendBefore = beforeIdx === -1 ? markerLength : -markerLength;
					const extendAfter = afterIdx === -1 ? markerLength : -markerLength;

					return {
						changes,
						range: EditorSelection.range(
							range.from + extendBefore,
							range.to + extendAfter
						),
					};
				});

				dispatch(
					state.update(changes, {
						scrollIntoView: true,
						annotations: Transaction.userEvent.of("input"),
					})
				);

				return true;
			};
		},
		[getFormatMarker, getFormatMarkerLength]
	);

	const setKeymapConfig = useCallback(
		() => [
			indentWithTab,
			{ key: "Mod-b", run: applyFormat(FormatType.BOLD) },
			{ key: "Mod-i", run: applyFormat(FormatType.ITALIC) },
			{ key: "Mod-e", run: applyFormat(FormatType.CODE) },
			{ key: "Mod-Shift-x", run: applyFormat(FormatType.STRIKETHROUGH) },
		],
		[applyFormat]
	);

	const toggleButtonChangeHandler = useCallback(
		(
			selectedFormats: Set<FormatType>,
			onChangeToolBarState: Dispatch<SetStateAction<ToolBarState>>
		) => {
			return (_event: MouseEvent<HTMLElement>, format: FormatType) => {
				if (!cmView) return;

				const newSelectedFormats = new Set(selectedFormats);
				if (newSelectedFormats.has(format)) {
					newSelectedFormats.delete(format);
				} else {
					newSelectedFormats.add(format);
				}
				onChangeToolBarState((prev) => ({
					...prev,
					selectedFormats: newSelectedFormats,
				}));
				applyFormat(format)(cmView);
			};
		},
		[cmView, applyFormat]
	);

	const checkAndAddFormat = useCallback(
		(
			selectedTextStart: string,
			selectedTextEnd: string,
			marker: string,
			format: FormatType,
			formats: Set<FormatType>
		) => {
			if (selectedTextStart.includes(marker) && selectedTextEnd.includes(marker)) {
				formats.add(format);
			}
		},
		[]
	);

	return {
		getFormatMarkerLength,
		applyFormat,
		setKeymapConfig,
		toggleButtonChangeHandler,
		checkAndAddFormat,
	};
};
