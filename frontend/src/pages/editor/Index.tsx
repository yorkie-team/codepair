import { useEffect } from "react";
import Editor from "../../components/editor/Editor";
import * as yorkie from "yorkie-js-sdk";
import { selectEditor, setClient, setDoc } from "../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import {
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType,
} from "../../utils/yorkie/yorkieSync";
import randomColor from "randomcolor";
import Color from "color";
import { Box, Paper } from "@mui/material";
import Resizable from "react-resizable-layout";
import { useWindowWidth } from "@react-hook/window-size";
import Preview from "../../components/editor/Preview";
import { useParams } from "react-router-dom";

function EditorIndex() {
	const dispatch = useDispatch();
	const windowWidth = useWindowWidth();
	const editorStore = useSelector(selectEditor);
	const params = useParams();

	useEffect(() => {
		let client: yorkie.Client;
		let doc: yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;

		if (!params.documentId) return;

		const initializeYorkie = async () => {
			client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
			});
			await client.activate();

			doc = new yorkie.Document(params.documentId as string);

			await client.attach(doc, {
				initialPresence: {
					name: "Yorkie",
					color: Color(randomColor()).fade(0.15).toString(),
					selection: null,
				},
			});
			dispatch(setDoc(doc));
			dispatch(setClient(client));
		};
		initializeYorkie();

		return () => {
			const cleanUp = async () => {
				await client?.deactivate();
				dispatch(setDoc(null));
				dispatch(setClient(null));
			};

			cleanUp();
		};
	}, [dispatch, params.documentId]);

	return (
		<Box height="calc(100% - 64px)">
			{/* For Markdown Preview Theme */}
			<div className="wmde-markdown-var" />
			{editorStore.mode === "both" && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: width, separatorProps }) => (
						<div
							id="wrapper"
							style={{
								display: "flex",
								height: "100%",
								overflow: "hidden",
							}}
						>
							<div id="left-block" style={{ width }}>
								<Editor />
							</div>
							<Paper
								id="splitter"
								{...separatorProps}
								sx={{
									height: "100%",
									width: 8,
									borderRadius: 0,
									cursor: "col-resize",
									zIndex: 100,
								}}
							/>
							<div
								className="right-block"
								style={{ width: `calc(100% - ${width}px)`, overflow: "auto" }}
							>
								<Box sx={{ p: 4 }} height="100%">
									<Preview />
								</Box>
							</div>
						</div>
					)}
				</Resizable>
			)}
			{editorStore.mode === "read" && (
				<Box sx={{ p: 4, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
			{editorStore.mode === "edit" && <Editor />}
		</Box>
	);
}

export default EditorIndex;
