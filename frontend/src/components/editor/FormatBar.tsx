import { Popover, ToggleButtonGroup } from "@mui/material";
import TooltipToggleButton from "../common/TooltipToggleButton";
import { FormatBarState, useFormatUtils, FormatType } from "../../hooks/useFormatUtils";

interface FormatBarProps {
	formatBarState: FormatBarState;
	onChangeFormatBarState: React.Dispatch<React.SetStateAction<FormatBarState>>;
}

function FormatBar({
	formatBarState: { show: showFormatBar, position: formatBarPosition, selectedFormats },
	onChangeFormatBarState,
}: FormatBarProps) {
	const { toggleButtonChangeHandler } = useFormatUtils();

	return (
		<Popover
			open={showFormatBar}
			anchorReference="anchorPosition"
			anchorPosition={{
				top: formatBarPosition.top,
				left: formatBarPosition.left,
			}}
			onClose={() => onChangeFormatBarState((prev) => ({ ...prev, show: false }))}
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
				onChange={toggleButtonChangeHandler(selectedFormats, onChangeFormatBarState)}
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
