import { Card, CardActionArea, Fade, Popper, Stack, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDebounce } from "react-use";
import { INTELLIGENCE_FOOTER_ID, INTELLIGENCE_HEADER_ID } from "../../constants/intelligence";
import YorkieIntelligenceFooter from "./YorkieIntelligenceFooter";

function YorkieIntelligence() {
	const theme = useTheme();
	const [footerOpen, setFooterOpen] = useState(false);
	const [intelligenceHeaderPivot, setIntelligenceHeaderPivot] = useState<Element | null>(null);
	const [intelligenceFooterPivot, setIntelligenceFooterPivot] = useState<Element | null>(null);
	const [debouncedPivot, setDebouncedPivot] = useState<Element | null>(null);

	useDebounce(
		() => {
			setDebouncedPivot(intelligenceHeaderPivot);
		},
		500,
		[intelligenceHeaderPivot]
	);

	useEffect(() => {
		document.addEventListener("selectionchange", function () {
			const intelligenceHeaderPivot = document.getElementById(INTELLIGENCE_HEADER_ID);
			const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);
			setIntelligenceHeaderPivot(intelligenceHeaderPivot);
			setIntelligenceFooterPivot(intelligenceFooterPivot);

			if (!intelligenceHeaderPivot) {
				setFooterOpen(false);
				setDebouncedPivot(null);
			}
		});
	}, []);

	const handleFooterOpen = () => {
		setFooterOpen((prev) => !prev);
	};

	if (!debouncedPivot || !intelligenceFooterPivot) return;

	return (
		<>
			<Popper
				open={Boolean(debouncedPivot)}
				anchorEl={debouncedPivot}
				placement="top-start"
				transition
			>
				{({ TransitionProps }) => (
					<Fade {...TransitionProps}>
						<Card
							sx={{
								boxShadow: theme.shadows[11],
								borderRadius: 2,
								mb: 1,
							}}
						>
							<CardActionArea
								sx={{
									paddingX: 1.3,
									paddingY: 0.3,
								}}
								onClick={handleFooterOpen}
							>
								<Stack direction="row" alignItems="center" gap={1}>
									<img src="/yorkie.png" height={20} />
									<Typography variant="subtitle1">Yorkie Intelligence</Typography>
								</Stack>
							</CardActionArea>
						</Card>
					</Fade>
				)}
			</Popper>
			{footerOpen &&
				createPortal(
					<YorkieIntelligenceFooter onClose={handleFooterOpen} />,
					intelligenceFooterPivot
				)}
		</>
	);
}

export default YorkieIntelligence;
