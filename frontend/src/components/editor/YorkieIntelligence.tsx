import { Card, CardActionArea, Fade, Stack, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDebounce } from "react-use";

function YorkieIntelligence() {
	const theme = useTheme();
	const [draggedContents, setDraggedContents] = useState("");
	const [intelligencePivot, setIntelligencePivot] = useState<Element | null>(null);
	const [debouncedPivot, setDebouncedPivot] = useState<Element | null>(null);

	useDebounce(
		() => {
			setDebouncedPivot(intelligencePivot);
		},
		500,
		[intelligencePivot]
	);

	useEffect(() => {
		document.addEventListener("selectionchange", function () {
			const intelligencePivot = document.querySelector("#yorkie-intelligence");
			setIntelligencePivot(intelligencePivot);

			if (intelligencePivot) {
				const selection = window.getSelection();
				setDraggedContents(selection!.toString());
			}
		});
	}, []);

	if (!debouncedPivot) return;

	return createPortal(
		<Fade in>
			<Card
				sx={{
					position: "absolute",
					// left: 0,
					transform: "translateY(-200%)",
					boxShadow: theme.shadows[11],
					borderRadius: 2,
				}}
			>
				<CardActionArea
					sx={{
						paddingX: 1.3,
						paddingY: 0.3,
					}}
				>
					<Stack direction="row" alignItems="center" gap={1}>
						<img src="/public/yorkie.png" height={20} />
						<Typography variant="subtitle1">Yorkie Intelligence</Typography>
					</Stack>
				</CardActionArea>
			</Card>
		</Fade>,
		debouncedPivot
	);
}

export default YorkieIntelligence;
