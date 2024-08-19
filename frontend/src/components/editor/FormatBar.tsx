import { ButtonGroup, Popover, ToggleButtonGroup, Box } from "@mui/material";
import TooltipToggleButton from "../common/TooltipToggleButton";
import { ToolBarState, useFormatUtils, FormatType } from "../../hooks/useFormatUtils";
import YorkieIntelligence from "./YorkieIntelligence";

interface ToolBarProps {
	toolBarState: ToolBarState;
	onChangeToolBarState: React.Dispatch<React.SetStateAction<ToolBarState>>;
}

function ToolBar({
	toolBarState: { show: showFormatBar, position: formatBarPosition, selectedFormats },
	onChangeToolBarState,
}: ToolBarProps) {
	const { toggleButtonChangeHandler } = useFormatUtils();

	return (
		<Popover
			open={showFormatBar}
			anchorReference="anchorPosition"
			anchorPosition={{
				top: formatBarPosition.top,
				left: formatBarPosition.left,
			}}
			onClose={() => onChangeToolBarState((prev) => ({ ...prev, show: false }))}
			anchorOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			transformOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			disableAutoFocus
			sx={{
				"& .MuiPopover-paper": {
					display: "flex",
					alignItems: "center",
				},
			}}
		>
			<ButtonGroup sx={{ height: "100%", margin: "3px 7px" }}>
				<YorkieIntelligence />
			</ButtonGroup>
			<Box sx={{ borderLeft: 1, height: "15px", borderColor: "#dddddd" }} />
			<ToggleButtonGroup
				sx={{ margin: "3px 7px" }}
				value={Array.from(selectedFormats)}
				onChange={toggleButtonChangeHandler(selectedFormats, onChangeToolBarState)}
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

export default ToolBar;
