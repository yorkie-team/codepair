import { EditorView } from "@codemirror/view";
import { Popover, ToggleButtonGroup } from "@mui/material";
import { FormatType } from "../../utils/format";
import TooltipToggleButton from "../common/TooltipToggleButton";

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
				<TooltipToggleButton
					color={selectedFormats.has(FormatType.ITALIC) ? "primary" : "secondary"}
					title={"Cmd+I / Ctrl+I"}
					value={FormatType.ITALIC}
				>
					<i>i</i>
				</TooltipToggleButton>
				<TooltipToggleButton
					color={selectedFormats.has(FormatType.BOLD) ? "primary" : "secondary"}
					title={"Cmd+B / Ctrl+B"}
					value={FormatType.BOLD}
				>
					<strong>B</strong>
				</TooltipToggleButton>
				<TooltipToggleButton
					color={selectedFormats.has(FormatType.STRIKETHROUGH) ? "primary" : "secondary"}
					title={"Cmd+Shift+X / Ctrl+Shfit+X"}
					value={FormatType.STRIKETHROUGH}
				>
					~
				</TooltipToggleButton>
				<TooltipToggleButton
					color={selectedFormats.has(FormatType.CODE) ? "primary" : "secondary"}
					title={"Cmd+E / Ctrl+E"}
					value={FormatType.CODE}
				>
					{"</>"}
				</TooltipToggleButton>
			</ToggleButtonGroup>
		</Popover>
	);
}

export default FormatBar;
