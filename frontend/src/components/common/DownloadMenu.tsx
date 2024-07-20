import { SaveAlt as SaveAltIcon } from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Paper } from "@mui/material";
import { MouseEvent, useState } from "react";
import { useFileExport } from "../../hooks/useFileExport";

const DownloadMenu = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const { handleExportToPDF, handleExportToHTML, handleExportToMarkdown } = useFileExport();

	return (
		<Paper>
			<IconButton aria-controls="download-menu" aria-haspopup="true" onClick={handleClick}>
				<SaveAltIcon />
			</IconButton>
			<Menu
				id="download-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<MenuItem onClick={handleExportToPDF}>Download as PDF</MenuItem>
				<MenuItem onClick={handleExportToHTML}>Download as HTML</MenuItem>
				<MenuItem onClick={handleExportToMarkdown}>Download as Markd</MenuItem>
			</Menu>
		</Paper>
	);
};

export default DownloadMenu;
