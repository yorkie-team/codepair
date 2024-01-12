import { useEffect } from "react";
import Editor from "../../components/editor/Editor";
import * as yorkie from "yorkie-js-sdk";
import { setClient, setDoc } from "../../store/editorSlice";
import { useDispatch } from "react-redux";
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

function EditorIndex() {
	const dispatch = useDispatch();
	const windowWidth = useWindowWidth();

	useEffect(() => {
		let client: yorkie.Client;
		let doc: yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;

		const initializeYorkie = async () => {
			client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
			});
			await client.activate();

			doc = new yorkie.Document("my-first-document");

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
	}, [dispatch]);

	return (
		<Box height="calc(100% - 64px)">
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
							<div className="wmde-markdown-var" />
							<Box sx={{ p: 4 }} height="100%">
								<Preview />
							</Box>
						</div>
					</div>
				)}
			</Resizable>
		</Box>
	);
}

export default EditorIndex;
