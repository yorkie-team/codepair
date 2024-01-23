import { IconButton } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ShareModal from "../modals/ShareModal";
import { useState } from "react";

function ShareButton() {
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const handleShareModalOpen = () => {
		setShareModalOpen((prev) => !prev);
	};

	return (
		<>
			<IconButton onClick={handleShareModalOpen} color="inherit">
				<ShareIcon />
			</IconButton>
			<ShareModal open={shareModalOpen} onClose={handleShareModalOpen} />
		</>
	);
}

export default ShareButton;
