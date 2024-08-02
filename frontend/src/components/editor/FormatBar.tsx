import { EditorView } from "@codemirror/view";
import { Popover, ToggleButtonGroup } from "@mui/material";
import { FormatType } from "../../utils/format";
import TooltipButton from "./TooltipButton";

interface FormatBarProps {
	formatBarState: {
		show: boolean;
		position: { top: number; left: number };
		selectedFormats: Set<FormatType>;
	};
	setFormatBarState: React.Dispatch<
		React.SetStateAction<{
			show: boolean;
			position: { top: number; left: number };
			selectedFormats: Set<FormatType>;
		}>
	>;
	applyFormat: (format: FormatType) => (view: EditorView) => void;
	cmView: EditorView;
}

function FormatBar({
	formatBarState: { show: showFormatBar, position: formatBarPosition, selectedFormats },
	setFormatBarState,
	applyFormat,
	cmView,
}: FormatBarProps) {
	return (
		<Popover
			open={showFormatBar}
			anchorReference="anchorPosition"
			anchorPosition={{
				top: formatBarPosition.top,
				left: formatBarPosition.left,
			}}
			onClose={() => setFormatBarState((prev) => ({ ...prev, show: false }))}
			anchorOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			transformOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			disableAutoFocus
		>
			<ToggleButtonGroup
				sx={{ padding: "3px 5px" }}
				value={Array.from(selectedFormats)}
				onChange={(_, format: FormatType) => {
					const newSelectedFormats = new Set(selectedFormats);
					if (newSelectedFormats.has(format)) {
						newSelectedFormats.delete(format);
					} else {
						newSelectedFormats.add(format);
					}
					setFormatBarState((prev) => ({ ...prev, selectedFormats: newSelectedFormats }));
					applyFormat(format)(cmView);
				}}
				exclusive
				aria-label="text formatting"
			>
				<TooltipButton
					selectedFormats={selectedFormats}
					formatType={FormatType.ITALIC}
					title={"Cmd+I / Ctrl+I"}
					value={<i>i</i>}
				/>
				<TooltipButton
					selectedFormats={selectedFormats}
					formatType={FormatType.BOLD}
					title={"Cmd+B / Ctrl+B"}
					value={<strong>B</strong>}
				/>
				<TooltipButton
					selectedFormats={selectedFormats}
					formatType={FormatType.STRIKETHROUGH}
					title={"Cmd+Shift+X / Ctrl+Shfit+X"}
					value={"~"}
				/>
				<TooltipButton
					selectedFormats={selectedFormats}
					formatType={FormatType.CODE}
					title={"Cmd+E / Ctrl+E"}
					value={"</>"}
				/>
			</ToggleButtonGroup>
		</Popover>
	);
}

export default FormatBar;
