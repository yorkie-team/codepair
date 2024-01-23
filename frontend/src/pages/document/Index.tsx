import { useContext, useEffect } from "react";
import Editor from "../../components/editor/Editor";
import * as yorkie from "yorkie-js-sdk";
import { selectEditor, setClient, setDoc, setShareRole } from "../../store/editorSlice";
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
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useGetDocumentBySharingTokenQuery, useGetDocumentQuery } from "../../hooks/api/document";
import { AuthContext } from "../../contexts/AuthContext";
import { selectUser } from "../../store/userSlice";

function EditorIndex() {
	const dispatch = useDispatch();
	const params = useParams();
	const userStore = useSelector(selectUser);
	const { isLoggedIn } = useContext(AuthContext);
	const [searchParams] = useSearchParams();
	const windowWidth = useWindowWidth();
	const editorStore = useSelector(selectEditor);
	const { data: document, isError: isDocumentError } = useGetDocumentQuery(
		isLoggedIn ? params.documentSlug : null
	);
	const { data: sharedDocument, isError: isSharedDocumentError } =
		useGetDocumentBySharingTokenQuery(searchParams.get("token"));

	useEffect(() => {
		let client: yorkie.Client;
		let doc: yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;
		const yorkieDocuentId = document?.yorkieDocumentId || sharedDocument?.yorkieDocumentId;
		const name = searchParams.get("token") ? "Anonymous" : userStore.data?.nickname;

		if (!yorkieDocuentId || !name) return;

		const initializeYorkie = async () => {
			client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
			});
			await client.activate();

			doc = new yorkie.Document(yorkieDocuentId as string);

			await client.attach(doc, {
				initialPresence: {
					name,
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
	}, [
		dispatch,
		document?.yorkieDocumentId,
		sharedDocument?.yorkieDocumentId,
		userStore.data?.nickname,
		searchParams,
	]);

	useEffect(() => {
		if (!sharedDocument) return;

		dispatch(setShareRole(sharedDocument.role));

		return () => {
			setShareRole(null);
		};
	}, [dispatch, sharedDocument, sharedDocument?.role]);

	if (isDocumentError || isSharedDocumentError)
		return <Navigate to="/" state={{ from: location }} replace />;

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
