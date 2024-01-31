import { Card, Fade, useTheme } from "@mui/material";
import YorkieIntelligenceFeatureList from "./YorkieIntelligenceFeatureList";
import { useState } from "react";
import { IntelligenceFeature } from "../../constants/intelligence";
import YorkieIntelligenceFeature from "./YorkieIntelligenceFeature";

function YorkieIntelligenceFooter() {
	const theme = useTheme();
	const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
	const [selectedFeature, setSelectedFeature] = useState<IntelligenceFeature | null>(null);

	const handleSelectFeature = (feature: IntelligenceFeature, title: string) => {
		setSelectedFeature(feature);
		setSelectedTitle(title);
	};

	return (
		<Fade in>
			<Card
				sx={{
					position: "absolute",
					boxShadow: theme.shadows[11],
					borderRadius: 2,
					width: "calc(100% - 54px)",
					padding: 2,
					mt: 1,
				}}
			>
				{selectedFeature && selectedTitle ? (
					<YorkieIntelligenceFeature
						title={selectedTitle}
						feature={selectedFeature}
					/>
				) : (
					<YorkieIntelligenceFeatureList onSelectFeature={handleSelectFeature} />
				)}
			</Card>
		</Fade>
	);
}

export default YorkieIntelligenceFooter;
