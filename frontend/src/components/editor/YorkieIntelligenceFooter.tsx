import { Box, Card, Fade, Popover, useTheme } from "@mui/material";
import YorkieIntelligenceFeatureList from "./YorkieIntelligenceFeatureList";
import { useEffect, useMemo, useRef, useState } from "react";
import { IntelligenceFeature } from "../../constants/intelligence";
import YorkieIntelligenceFeature from "./YorkieIntelligenceFeature";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";

interface YorkieIntelligenceFooterProps {
	onClose: () => void;
}

function YorkieIntelligenceFooter(props: YorkieIntelligenceFooterProps) {
	const { onClose } = props;
	const theme = useTheme();
	const editorStore = useSelector(selectEditor);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
	const [selectedFeature, setSelectedFeature] = useState<IntelligenceFeature | null>(null);
	const [anchorEl, setAnchorEl] = useState<HTMLSpanElement>();
	const handleSelectFeature = (feature: IntelligenceFeature, title: string) => {
		setSelectedFeature(feature);
		setSelectedTitle(title);
	};
	const width = useMemo(
		() => editorStore.cmView!.contentDOM.getBoundingClientRect().width - 12,
		[editorStore.cmView]
	);
	console.log(width);

	useEffect(() => {
		if (!anchorRef.current) return;

		setAnchorEl(anchorRef.current);

		return () => {
			setAnchorEl(undefined);
		};
	}, [anchorRef.current]);

	return (
		<Box
			sx={{
				position: "absolute",
				mt: 1,
			}}
		>
			<span
				ref={anchorRef}
				style={{
					marginTop: 4,
				}}
			/>
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
			>
				<Card
					sx={{
						boxShadow: theme.shadows[11],
						borderRadius: 2,
						width,
						padding: 2,
					}}
				>
					{selectedFeature && selectedTitle ? (
						<YorkieIntelligenceFeature
							title={selectedTitle}
							feature={selectedFeature}
							onClose={onClose}
						/>
					) : (
						<YorkieIntelligenceFeatureList onSelectFeature={handleSelectFeature} />
					)}
				</Card>
			</Popover>
		</Box>
	);
}

export default YorkieIntelligenceFooter;
