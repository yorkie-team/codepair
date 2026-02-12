import { Button, Menu, MenuItem, Paper } from "@mui/material";
import { useState, type MouseEvent } from "react";
import { useCMEditorContext } from "../CMEditorContext";
import { CodeKeyType } from "../types";

export const BOTTOM_BAR_HEIGHT = 25;

interface EditorBottomBarProps {
	width: number | string;
}

function EditorBottomBar(props: EditorBottomBarProps) {
	const { width } = props;
	const { codeKey, setCodeKey } = useCMEditorContext();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleChangeCodeKey = (newKeyCode: CodeKeyType) => {
		setCodeKey(newKeyCode);
		handleClose();
	};

	return (
		<Paper
			variant="outlined"
			sx={{
				position: "absolute",
				bottom: 0,
				left: 0,
				width,
				borderTop: 1,
				borderColor: "divider",
				height: BOTTOM_BAR_HEIGHT,
				display: "flex",
				backgroundColor: "background.paper",
			}}
		>
			<Button variant="text" onClick={handleOpen}>
				{codeKey}
			</Button>
			<Menu
				id="codekey-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
			>
				{Object.values(CodeKeyType).map((keyType) => (
					<MenuItem key={keyType} onClick={() => handleChangeCodeKey(keyType)}>
						{keyType}
					</MenuItem>
				))}
			</Menu>
		</Paper>
	);
}

export default EditorBottomBar;
