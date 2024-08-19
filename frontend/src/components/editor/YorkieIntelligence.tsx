import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INTELLIGENCE_FOOTER_ID } from "../../constants/intelligence";
import YorkieIntelligenceFooter from "./YorkieIntelligenceFooter";
import { useSelector } from "react-redux";
import { selectSetting } from "../../store/settingSlice";

function YorkieIntelligence() {
	const [footerOpen, setFooterOpen] = useState(false);
	const [intelligenceFooterPivot, setIntelligenceFooterPivot] = useState<Element | null>(null);

	const { yorkieIntelligence } = useSelector(selectSetting);

	useEffect(() => {
		document.addEventListener("selectionchange", function () {
			const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);
			setIntelligenceFooterPivot(intelligenceFooterPivot);
		});
	}, []);

	const handleFooterOpen = () => {
		setFooterOpen((prev) => !prev);
	};

	const activated = intelligenceFooterPivot && yorkieIntelligence?.enable;

	return (
		<>
			<Button
				onClick={handleFooterOpen}
				sx={{
					padding: "3px 5px",
					border: "none",
					"&:hover": {
						border: "none",
					},
				}}
				disabled={!activated}
			>
				<img
					src="/yorkie.png"
					height={20}
					alt="yorkie_img"
					style={{ filter: activated ? "none" : "grayscale(100%)" }}
				/>
				<Typography variant="subtitle1" fontSize={14}>
					Yorkie Intelligence
				</Typography>
			</Button>

			{footerOpen &&
				createPortal(
					<YorkieIntelligenceFooter onClose={handleFooterOpen} />,
					intelligenceFooterPivot as Element
				)}
		</>
	);
}

export default YorkieIntelligence;
