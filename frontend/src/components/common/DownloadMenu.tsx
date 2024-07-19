import { SaveAlt as SaveAltIcon } from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Paper } from "@mui/material";
import { MouseEvent, useCallback, useState } from "react";
import { useFileExport } from "../../hooks/useFileExport";

const DownloadMenu = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const { exportToPDF, exportToTXT, exportToDOCX } = useFileExport();

	const handleExportToPDF = useCallback(() => {
		exportToPDF();
		handleClose();
	}, [exportToPDF]);

	const handleExportToTXT = useCallback(() => {
		exportToTXT();
		handleClose();
	}, [exportToTXT]);

	const handleExportToDOCX = useCallback(() => {
		exportToDOCX();
		handleClose();
	}, [exportToDOCX]);

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
				<MenuItem onClick={handleExportToTXT}>Download as TXT</MenuItem>
				<MenuItem onClick={handleExportToDOCX}>Download as DOCX</MenuItem>
			</Menu>
		</Paper>
	);
};

export default DownloadMenu;
