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
					filter: activated ? "none" : "grayscale(100%)",
					pointerEvents: activated ? "auto" : "none",
					opacity: activated ? 1 : 0.7,
				}}
			>
				<img src="/yorkie.png" height={20} alt="yorkie_img" />
				<Typography variant="subtitle1" fontSize={14}>
					Yorkie Intelligence
				</Typography>
			</Button>

			{footerOpen &&
				activated &&
				createPortal(
					<YorkieIntelligenceFooter onClose={handleFooterOpen} />,
					intelligenceFooterPivot
				)}
		</>
	);
}

export default YorkieIntelligence;
