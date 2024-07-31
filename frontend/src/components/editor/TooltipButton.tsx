import { ToggleButton, Tooltip } from "@mui/material";
import { FormatType } from "../../utils/format";

interface TooltipButtonProps {
	selectedFormats: Set<FormatType>;
	formatType: FormatType;
	title: string;
	value: string | JSX.Element;
}

function TooltipButton({ selectedFormats, formatType, title, value }: TooltipButtonProps) {
	return (
		<Tooltip title={title} placement="top">
			<ToggleButton
				value={formatType}
				aria-label={formatType}
				color={selectedFormats.has(formatType) ? "primary" : "secondary"}
				sx={{
					width: "25px",
					height: "25px",
					minWidth: "25px",
					padding: "0",
					margin: "2px",
					border: "none",
					fontWeight: "bold",
				}}
			>
				{value}
			</ToggleButton>
		</Tooltip>
	);
}

export default TooltipButton;
