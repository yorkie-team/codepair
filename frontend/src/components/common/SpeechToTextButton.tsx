import React from "react";

interface SpeechToTextButtonProps {
	isListening: boolean;
	onClick: () => void;
	interimTranscript?: string;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
	isListening,
	onClick,
	interimTranscript,
}) => {
	return (
		<div
			style={{
				position: "absolute",
				bottom: "20px",
				right: "20px",
				zIndex: 100,
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
			}}
		>
			{isListening && interimTranscript && (
				<div
					style={{
						backgroundColor: "rgba(0,0,0,0.7)",
						color: "white",
						padding: "8px 12px",
						borderRadius: "8px",
						marginBottom: "10px",
						maxWidth: "300px",
						wordBreak: "break-word",
						fontSize: "14px",
					}}
				>
					{interimTranscript}
				</div>
			)}

			<button
				onClick={onClick}
				style={{
					width: "40px",
					height: "40px",
					borderRadius: "50%",
					backgroundColor: isListening ? "#f44336" : "#4285f4",
					border: "none",
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
					transition: "all 0.2s ease-in-out",
				}}
				title={isListening ? "Stop dictation" : "Start dictation"}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
					{isListening ? (
						// Stop icon
						<rect x="6" y="6" width="12" height="12" />
					) : (
						// Mic icon
						<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
					)}
					{!isListening && (
						<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
					)}
				</svg>
			</button>

			{isListening && (
				<div
					style={{
						marginTop: "5px",
						backgroundColor: "rgba(0,0,0,0.7)",
						color: "white",
						padding: "3px 8px",
						borderRadius: "4px",
						fontSize: "12px",
						whiteSpace: "nowrap",
					}}
				>
					Listening...
				</div>
			)}
		</div>
	);
};

export default SpeechToTextButton;
