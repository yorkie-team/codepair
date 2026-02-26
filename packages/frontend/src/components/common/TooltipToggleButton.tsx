import { ToggleButton, Tooltip, ToggleButtonProps } from "@mui/material";

const style = {
	toggleButton: {
		width: "25px",
		height: "25px",
		border: "none",
		fontWeight: "bold",
	},
};

function TooltipToggleButton({
	title,
	children,
	...props
}: ToggleButtonProps & { title?: string }) {
	return (
		<Tooltip title={title} placement="top">
			<ToggleButton sx={style.toggleButton} {...props}>
				{children}
			</ToggleButton>
		</Tooltip>
	);
}

export default TooltipToggleButton;
