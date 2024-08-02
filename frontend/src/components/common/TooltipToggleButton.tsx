import { ToggleButton, Tooltip, ToggleButtonProps } from "@mui/material";

const style = {
	toggleButton: {
		width: "25px",
		height: "25px",
		minWidth: "25px",
		padding: "0",
		margin: "2px",
		border: "none",
		fontWeight: "bold",
	},
};

function TooltipToggleButton({ title, ...props }: ToggleButtonProps & { title?: string }) {
	return (
		<Tooltip title={title} placement="top">
			<ToggleButton sx={style.toggleButton} {...props}>
				{props.children}
			</ToggleButton>
		</Tooltip>
	);
}

export default TooltipToggleButton;
