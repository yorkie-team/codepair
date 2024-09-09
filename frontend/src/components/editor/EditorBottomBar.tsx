import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CodeKeyType, selectEditor, setCodeKeyType } from "../../store/editorSlice";

export const BOTTOM_BAR_HEIGHT = 25;

function EditorBottomBar(props: { width: number | string }) {
	const { width } = props;
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleChangeCodeKey = (newKeyCode: CodeKeyType) => {
		dispatch(setCodeKeyType(newKeyCode));
		handleClose();
	};

	return (
		<div
			style={{
				position: "absolute",
				bottom: 0,
				left: 0,
				width,
				background: "000000",
				borderTop: "1px solid #ccc",
				height: BOTTOM_BAR_HEIGHT,
				display: "flex",
			}}
		>
			<Button variant="text" onClick={handleOpen}>
				{editorStore.codeKey}
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
		</div>
	);
}

export default EditorBottomBar;
