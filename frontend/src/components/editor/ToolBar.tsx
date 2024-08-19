import { Popover, ToggleButtonGroup, Divider, Stack } from "@mui/material";
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
		>
			<Stack direction={"row"} margin={"5px 7px"}>
				<YorkieIntelligence />
				<Divider
					orientation="vertical"
					flexItem
					sx={{ height: "20px", alignSelf: "center", margin: "0 5px" }}
				/>
				<ToggleButtonGroup
					value={Array.from(selectedFormats)}
					onChange={toggleButtonChangeHandler(selectedFormats, onChangeToolBarState)}
					exclusive
					aria-label="text formatting"
				>
					<Stack direction={"row"} gap={"5px"} alignItems={"center"}>
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
							color={
								selectedFormats.has(FormatType.STRIKETHROUGH)
									? "primary"
									: "secondary"
							}
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
					</Stack>
				</ToggleButtonGroup>
			</Stack>
		</Popover>
	);
}

export default ToolBar;
