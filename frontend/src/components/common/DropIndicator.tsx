import { Box } from "@mui/material";
import React from "react";

interface DropIndicatorProps {
	show: boolean;
	yPosition: number;
}

function DropIndicator({ show, yPosition }: DropIndicatorProps) {
	if (!show) return null;

	return (
		<Box
			sx={{
				position: "absolute",
				left: 0,
				right: 0,
				top: yPosition,
				height: 2,
				backgroundColor: "primary.main",
				zIndex: 1000,
				transition: "top 0.1s ease-out",
				"&::before": {
					content: '""',
					position: "absolute",
					left: -4,
					top: -2,
					width: 6,
					height: 6,
					backgroundColor: "primary.main",
					borderRadius: "50%",
				},
				"&::after": {
					content: '""',
					position: "absolute",
					right: -4,
					top: -2,
					width: 6,
					height: 6,
					backgroundColor: "primary.main",
					borderRadius: "50%",
				},
			}}
		/>
	);
}

export default React.memo(DropIndicator);
