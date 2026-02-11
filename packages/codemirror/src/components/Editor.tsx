import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode";
import { EditorView } from "codemirror";
import { useCallback, useEffect, useState } from "react";
import { ScrollSyncPane } from "react-scroll-sync";
import { SpeechToTextButton } from "@codepair/ui";
import { useFormatUtils } from "../hooks/useFormatUtils";
import { useToolBar } from "../hooks/useToolBar";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useCMEditorContext } from "../CMEditorContext";
import { CMEditorAdapter } from "../CMEditorAdapter";
import { imageUploader } from "../plugins/imageUploader";
import { intelligencePivot } from "../plugins/intelligencePivot";
import { urlHyperlinkInserter } from "../plugins/urlHyperlinkInserter";
import { yorkieCodeMirror } from "../plugins/yorkie";
import EditorBottomBar, { BOTTOM_BAR_HEIGHT } from "./EditorBottomBar";
import ToolBar from "./ToolBar";
import { CodeKeyType } from "../types";

interface EditorProps {
	width: number | string;
	intelligenceSlot?: React.ReactNode;
}

function Editor(props: EditorProps) {
	const { width, intelligenceSlot } = props;
	const [element, setElement] = useState<HTMLElement>();
	const {
		doc,
		client,
		setEditorPort,
		themeMode,
		codeKey,
		fileUploadEnabled,
		handleUploadImage,
		intelligenceEnabled,
	} = useCMEditorContext();
	const { applyFormat, setKeymapConfig, setupVimKeybindings } = useFormatUtils();
	const { toolBarState, setToolBarState, updateFormatBar } = useToolBar();

	const {
		state: speechToTextState,
		toggleListening,
		isSpeechRecognitionSupported,
	} = useSpeechToText();

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	useEffect(() => {
		if (!element || !doc || !client || typeof fileUploadEnabled !== "boolean") {
			return;
		}

		// Setup vim keybindings when vim mode is activated
		if (codeKey === CodeKeyType.VIM) {
			setupVimKeybindings();
		}

		const state = EditorState.create({
			doc: doc.getRoot().content?.toString() ?? "",
			extensions: [
				codeKey === CodeKeyType.VIM ? vim() : [],
				keymap.of(setKeymapConfig()),
				basicSetup({ highlightSelectionMatches: false, history: false }),
				markdown(),
				themeMode === "light" ? xcodeLight : xcodeDark,
				EditorView.theme({ "&": { width: "100%" } }),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						updateFormatBar(update);
					}
				}),
				yorkieCodeMirror(doc, client),
				...(intelligenceEnabled ? [intelligencePivot] : []),
				...(fileUploadEnabled && handleUploadImage
					? [imageUploader(handleUploadImage, doc)]
					: []),
				urlHyperlinkInserter(doc),
			],
		});

		const view = new EditorView({ state, parent: element });
		const adapter = new CMEditorAdapter(view);
		setEditorPort(adapter);

		return () => {
			setEditorPort(null);
			view?.destroy();
		};
	}, [
		element,
		client,
		doc,
		codeKey,
		themeMode,
		fileUploadEnabled,
		handleUploadImage,
		intelligenceEnabled,
		applyFormat,
		updateFormatBar,
		setKeymapConfig,
		setupVimKeybindings,
		setEditorPort,
	]);

	return (
		<>
			<div style={{ height: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)` }}>
				<ScrollSyncPane>
					<div
						style={{
							height: "100%",
							overflow: "auto",
							position: "relative",
						}}
					>
						<div
							ref={ref}
							style={{
								display: "flex",
								alignItems: "stretch",
								minHeight: "100%",
							}}
						/>
						{Boolean(toolBarState.show) && (
							<ToolBar
								toolBarState={toolBarState}
								onChangeToolBarState={setToolBarState}
								intelligenceSlot={intelligenceSlot}
							/>
						)}
						{isSpeechRecognitionSupported && (
							<SpeechToTextButton
								isListening={speechToTextState.isListening}
								onClick={toggleListening}
								interimTranscript={speechToTextState.interimTranscript}
							/>
						)}
					</div>
				</ScrollSyncPane>
			</div>
			<EditorBottomBar width={width} />
		</>
	);
}

export default Editor;
