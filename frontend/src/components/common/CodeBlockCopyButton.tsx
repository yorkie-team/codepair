import { IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { createPortal } from "react-dom";
import { useState } from "react";

const CopyButtonContainer = styled("div")(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(1),
	right: theme.spacing(1),
	zIndex: 1,
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
	background: theme.palette.background.default,
	color: theme.palette.text.primary,
	width: 32,
	height: 32,
	"&:hover": {
		background: theme.palette.background.paper,
	},
	"&:focus": {
		outline: `2px solid ${theme.palette.primary.main}`,
	},
	"&.copied": {
		background: theme.palette.success.main,
	},
}));

type CodeBlockCopyButtonProps = {
	codeText: string;
	onCopy: () => void;
	onError?: (error: string) => void;
	container: HTMLElement;
};

const CodeBlockCopyButton = ({
	codeText,
	onCopy,
	onError,
	container,
}: CodeBlockCopyButtonProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(codeText);
			setCopied(true);
			onCopy();

			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (error) {
			console.error("Failed to copy code:", error);
			onError?.("Failed to copy code to clipboard");
			// fallback: copy to clipboard using textarea
			try {
				const textArea = document.createElement("textarea");
				textArea.value = codeText;
				textArea.style.position = "fixed";
				textArea.style.left = "-999999px";
				textArea.style.top = "-999999px";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textArea);

				if (successful) {
					setCopied(true);
					onCopy();
					setTimeout(() => {
						setCopied(false);
					}, 2000);
				} else {
					onError?.("Failed to copy code to clipboard");
				}
			} catch (fallbackError) {
				console.error("Fallback copy failed:", fallbackError);
				onError?.("Failed to copy code to clipboard");
			}
		}
	};

	const buttonElement = (
		<CopyButtonContainer>
			<Tooltip title="Copy code" placement="top">
				<CopyButton
					onClick={handleCopy}
					className={copied ? "copied" : ""}
					aria-label="Copy code"
					size="small"
				>
					{copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
				</CopyButton>
			</Tooltip>
		</CopyButtonContainer>
	);

	return createPortal(buttonElement, container);
};

export default CodeBlockCopyButton;
