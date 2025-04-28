import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode";
import { EditorView } from "codemirror";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollSyncPane } from "react-scroll-sync";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { useFormatUtils } from "../../hooks/useFormatUtils";
import { useToolBar } from "../../hooks/useToolBar";
import { CodeKeyType, selectConfig } from "../../store/configSlice";
import { selectEditor, setCmView } from "../../store/editorSlice";
import { selectFeatureSetting } from "../../store/featureSettingSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { imageUploader } from "../../utils/imageUploader";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { urlHyperlinkInserter } from "../../utils/urlHyperlinkInserter";
import { yorkieCodeMirror } from "../../utils/yorkie";
import EditorBottomBar, { BOTTOM_BAR_HEIGHT } from "./EditorBottomBar";
import ToolBar from "./ToolBar";
import SpeechToTextButton from "../common/SpeechToTextButton";

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: (event: SpeechRecognitionEvent) => void;
	onerror: (event: SpeechRecognitionErrorEvent) => void;
	onend: () => void;
}

interface SpeechRecognitionEvent {
	results: SpeechRecognitionResultList;
	resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
	error: string;
	message: string;
}

declare global {
	interface Window {
		SpeechRecognition: new () => SpeechRecognition;
		webkitSpeechRecognition: new () => SpeechRecognition;
	}
}

interface EditorProps {
	width: number | string;
}

function Editor(props: EditorProps) {
	const { width } = props;
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const configStore = useSelector(selectConfig);
	const featureSettingStore = useSelector(selectFeatureSetting);
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createUploadUrl } = useCreateUploadUrlMutation();
	const { mutateAsync: uploadFile } = useUploadFileMutation();
	const { applyFormat, setKeymapConfig } = useFormatUtils();
	const { toolBarState, setToolBarState, updateFormatBar } = useToolBar();
	const [isListening, setIsListening] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const [interimTranscript, setInterimTranscript] = useState("");
	const finalTranscriptRef = useRef("");

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	useEffect(() => {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.continuous = true;
			recognitionRef.current.interimResults = true;
			recognitionRef.current.lang = "ko-KR";
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
		};
	}, []);

	useEffect(() => {
		if (!recognitionRef.current || !editorStore.cmView || !editorStore.doc) return;

		recognitionRef.current.onresult = (event) => {
			let interimTranscript = "";
			let finalTranscript = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcript + " ";
				} else {
					interimTranscript += transcript;
				}
			}

			if (finalTranscript) {
				finalTranscriptRef.current = finalTranscript;

				const cursor = editorStore.cmView!.state.selection.main;
				const from = cursor.from;
				const to = cursor.to;
				const newCursorPos = from + finalTranscript.length;

				editorStore.doc?.update((root, presence) => {
					root.content.edit(from, to, finalTranscript);
					presence.set({
						selection: root.content.indexRangeToPosRange([newCursorPos, newCursorPos]),
					});
				});

				editorStore.cmView!.dispatch({
					changes: { from, to, insert: finalTranscript },
					selection: { anchor: newCursorPos, head: newCursorPos },
				});
			}

			setInterimTranscript(interimTranscript);
		};

		recognitionRef.current.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setIsListening(false);
		};

		recognitionRef.current.onend = () => {
			setIsListening(false);
			setInterimTranscript("");
			finalTranscriptRef.current = "";
		};
	}, [editorStore.cmView, editorStore.doc]);

	// Toggle speech recognition
	const toggleListening = useCallback(() => {
		if (!recognitionRef.current) {
			// Show browser compatibility warning if Speech Recognition is not available
			alert(
				"Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari."
			);
			return;
		}

		if (isListening) {
			recognitionRef.current.stop();
			setInterimTranscript("");
		} else {
			recognitionRef.current.start();
			setIsListening(true);
			finalTranscriptRef.current = "";
		}
	}, [isListening]);

	useEffect(() => {
		if (
			!element ||
			!editorStore.doc ||
			!editorStore.client ||
			typeof featureSettingStore.fileUpload?.enable !== "boolean"
		) {
			return;
		}

		const handleUploadImage = async (file: File) => {
			if (!workspaceStore.data) return "";

			const uploadUrlData = await createUploadUrl({
				workspaceId: workspaceStore.data.id,
				contentLength: new Blob([file]).size,
				contentType: file.type,
			});

			await uploadFile({ ...uploadUrlData, file });

			return `${import.meta.env.VITE_API_ADDR}/files/${uploadUrlData.fileKey}`;
		};

		const state = EditorState.create({
			doc: editorStore.doc.getRoot().content?.toString() ?? "",
			extensions: [
				configStore.codeKey === CodeKeyType.VIM ? vim() : [],
				keymap.of(setKeymapConfig()),
				basicSetup({ highlightSelectionMatches: false }),
				markdown(),
				themeMode === "light" ? xcodeLight : xcodeDark,
				EditorView.theme({ "&": { width: "100%" } }),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						updateFormatBar(update);
					}
				}),
				yorkieCodeMirror(editorStore.doc, editorStore.client),
				intelligencePivot,
				...(featureSettingStore.fileUpload?.enable
					? [imageUploader(handleUploadImage, editorStore.doc)]
					: []),
				urlHyperlinkInserter(editorStore.doc),
			],
		});

		const view = new EditorView({ state, parent: element });
		dispatch(setCmView(view));

		return () => {
			view?.destroy();
		};
	}, [
		element,
		editorStore.client,
		editorStore.doc,
		configStore.codeKey,
		themeMode,
		workspaceStore.data,
		featureSettingStore.fileUpload?.enable,
		dispatch,
		createUploadUrl,
		uploadFile,
		applyFormat,
		updateFormatBar,
		setKeymapConfig,
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
							/>
						)}
						<SpeechToTextButton
							isListening={isListening}
							onClick={toggleListening}
							interimTranscript={interimTranscript}
						/>
					</div>
				</ScrollSyncPane>
			</div>
			<EditorBottomBar width={width} />
		</>
	);
}

export default Editor;
