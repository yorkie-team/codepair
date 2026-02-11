import { useCallback, useState, useRef } from "react";
import type { EditorPort } from "@codepair/ui";
import { EditorModeType } from "@codepair/ui";
import { CMEditorContext, CMEditorContextValue } from "./CMEditorContext";
import type { CodePairDocType } from "./types";
import { CodeKeyType } from "./types";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import { Box, Paper } from "@mui/material";
import Resizable from "react-resizable-layout";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";

export interface CMEditorSuiteProps {
	doc: CodePairDocType;
	client: import("@yorkie-js/sdk").Client;
	mode: EditorModeType;
	width: number | string;
	themeMode: "light" | "dark";
	codeKey: CodeKeyType;
	onCodeKeyChange: (key: CodeKeyType) => void;
	fileUploadEnabled: boolean;
	handleUploadImage: ((file: File) => Promise<string>) | null;
	intelligenceEnabled: boolean;
	intelligenceSlot?: React.ReactNode;
	disableScrollSync?: boolean;
	onEditorPortChange?: (port: EditorPort | null) => void;
}

function CMEditorSuite({
	doc,
	client,
	mode,
	width,
	themeMode,
	codeKey,
	onCodeKeyChange,
	fileUploadEnabled,
	handleUploadImage,
	intelligenceEnabled,
	intelligenceSlot,
	disableScrollSync,
	onEditorPortChange,
}: CMEditorSuiteProps) {
	const [editorPort, setEditorPortInternal] = useState<EditorPort | null>(null);
	const onEditorPortChangeRef = useRef(onEditorPortChange);
	onEditorPortChangeRef.current = onEditorPortChange;

	const setEditorPort = useCallback((port: EditorPort | null) => {
		setEditorPortInternal(port);
		onEditorPortChangeRef.current?.(port);
	}, []);

	const ctxValue: CMEditorContextValue = {
		doc,
		client,
		editorPort,
		setEditorPort,
		themeMode,
		codeKey,
		setCodeKey: onCodeKeyChange,
		fileUploadEnabled,
		handleUploadImage,
		intelligenceEnabled,
		width,
	};

	const windowWidth = typeof width === "number" ? width : 800;

	return (
		<CMEditorContext.Provider value={ctxValue}>
			{mode === EditorModeType.BOTH && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: splitWidth, separatorProps }) => (
						<ScrollSync enabled={!disableScrollSync}>
							<div
								id="wrapper"
								style={{
									display: "flex",
									height: "100%",
									overflow: "hidden",
									position: "relative",
								}}
							>
								<div
									id="left-block"
									style={{
										width: splitWidth,
										position: "relative",
										height: "100%",
									}}
								>
									<Editor
										width={splitWidth}
										intelligenceSlot={intelligenceSlot}
									/>
								</div>
								<Paper
									id="splitter"
									{...separatorProps}
									onMouseDown={() => {
										document.body.style.userSelect = "none";
									}}
									onMouseUp={() => {
										document.body.style.userSelect = "auto";
									}}
									sx={{
										height: "100%",
										width: 8,
										borderRadius: 0,
										cursor: "col-resize",
										zIndex: 0,
									}}
								/>
								<ScrollSyncPane>
									<div
										className="right-block"
										style={{
											width: `calc(100% - ${splitWidth}px)`,
											overflow: "auto",
										}}
									>
										<Box sx={{ p: 4 }} height="100%">
											<Preview />
										</Box>
									</div>
								</ScrollSyncPane>
							</div>
						</ScrollSync>
					)}
				</Resizable>
			)}

			{mode === EditorModeType.EDIT && (
				<div style={{ position: "relative", height: "100%" }}>
					<Editor width={"100%"} intelligenceSlot={intelligenceSlot} />
				</div>
			)}

			{mode === EditorModeType.READ && (
				<Box sx={{ p: 4, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
		</CMEditorContext.Provider>
	);
}

export default CMEditorSuite;
