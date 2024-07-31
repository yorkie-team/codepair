import { EditorView } from "@codemirror/view";
import { Popover, ToggleButtonGroup } from "@mui/material";
import { FormatType } from "../../utils/format";
import TooltipButton from "./TooltipButton";

interface FormatBarProps {
	showFormatBar: boolean;
	setShowFormatBar: (show: boolean) => void;
	selectedFormats: Set<FormatType>;
	setSelectedFormats: (formats: Set<FormatType>) => void;
	formatBarPosition: { top: number; left: number };
	applyFormat: (format: FormatType) => (view: EditorView) => void;
	cmView: EditorView;
}

function FormatBar({
	showFormatBar,
	setShowFormatBar,
	formatBarPosition,
	selectedFormats,
	setSelectedFormats,
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
			onClose={() => setShowFormatBar(false)}
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
				style={{ padding: "3px 5px" }}
				value={Array.from(selectedFormats)}
				onChange={(_, format: FormatType) => {
					if (selectedFormats.has(format)) {
						selectedFormats.delete(format);
					} else {
						selectedFormats.add(format);
					}
					setSelectedFormats(new Set(selectedFormats));
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
