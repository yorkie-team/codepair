import { Card, Fade, useTheme } from "@mui/material";

function YorkieIntelligenceFooter() {
    const theme = useTheme();

	return (
		<Fade in>
			<Card
				sx={{
					position: "absolute",
					transform: "translateY(20%)",
					boxShadow: theme.shadows[11],
					borderRadius: 2,
					maxWidth: "88%",
					width: 600,
				}}
			>
				
			</Card>
		</Fade>
	);
}

export default YorkieIntelligenceFooter;
