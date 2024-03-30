import ShareIcon from "@mui/icons-material/Share";
import ShareModal from "../modals/ShareModal";
import { useState } from "react";
import { Button } from "yorkie-ui";

function ShareButton() {
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const handleShareModalOpen = () => {
		setShareModalOpen((prev) => !prev);
	};

	return (
		<>
			<Button onClick={handleShareModalOpen} variant="ghost">
				<ShareIcon />
			</Button>
			<ShareModal open={shareModalOpen} onClose={handleShareModalOpen} />
		</>
	);
}

export default ShareButton;
