import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INTELLIGENCE_FOOTER_ID, INTELLIGENCE_HEADER_ID } from "../../constants/intelligence";
import YorkieIntelligenceFooter from "./YorkieIntelligenceFooter";

function YorkieIntelligence() {
	const [footerOpen, setFooterOpen] = useState(false);
	// const [intelligenceHeaderPivot, setIntelligenceHeaderPivot] = useState<Element | null>(null);
	const [intelligenceFooterPivot, setIntelligenceFooterPivot] = useState<Element | null>(null);
	// const [debouncedPivot, setDebouncedPivot] = useState<Element | null>(null);

	// useDebounce(
	// 	() => {
	// 		setDebouncedPivot(intelligenceHeaderPivot);
	// 	},
	// 	500,
	// 	[intelligenceHeaderPivot]
	// );

	useEffect(() => {
		document.addEventListener("selectionchange", function () {
			const intelligenceHeaderPivot = document.getElementById(INTELLIGENCE_HEADER_ID);
			const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);
			// setIntelligenceHeaderPivot(intelligenceHeaderPivot);
			setIntelligenceFooterPivot(intelligenceFooterPivot);

			if (!intelligenceHeaderPivot) {
				setFooterOpen(false);
				// setDebouncedPivot(null);
			}
		});
	}, []);

	const handleFooterOpen = () => {
		setFooterOpen((prev) => !prev);
	};

	if (!intelligenceFooterPivot) return;

	return (
		<>
			{/* <Popper
				open={Boolean(debouncedPivot)}
				anchorEl={debouncedPivot}
				placement="top-start"
				transition
			> */}
			{/* {({ TransitionProps }) => (
					<Fade {...TransitionProps}> */}
			{/* <Card
				sx={{
					boxShadow: theme.shadows[11],
					borderRadius: 2,
					mb: 1,
				}}
			> */}
			{/* <CardActionArea
					sx={{
						paddingX: 1.3,
						paddingY: 0.3,
					}}
					onClick={handleFooterOpen}
				> */}

			<Button
				onClick={handleFooterOpen}
				sx={{
					padding: "3px 5px",
					border: "none",
					"&:hover": {
						border: "none", // hover 시 보더 제거
						boxShadow: "none",
					},
				}}
			>
				<img src="/yorkie.png" height={20} />
				<Typography variant="body1" fontSize={14}>
					Yorkie Intelligence
				</Typography>
			</Button>

			{/* </CardActionArea> */}
			{/* </Card> */}
			{/* </Fade>
				)} */}
			{/* </Popper> */}
			{footerOpen &&
				createPortal(
					<YorkieIntelligenceFooter onClose={handleFooterOpen} />,
					intelligenceFooterPivot
				)}
		</>
	);
}

export default YorkieIntelligence;
