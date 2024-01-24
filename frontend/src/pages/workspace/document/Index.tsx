import { useEffect } from "react";
import * as yorkie from "yorkie-js-sdk";
import { setClient, setDoc } from "../../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import {
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType,
} from "../../../utils/yorkie/yorkieSync";
import randomColor from "randomcolor";
import Color from "color";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { useGetDocumentQuery } from "../../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../../hooks/api/workspace";
import DocumentView from "../../../components/editor/DocumentView";

function DocumentIndex() {
	const dispatch = useDispatch();
	const params = useParams();
	const userStore = useSelector(selectUser);
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const { data: document } = useGetDocumentQuery(workspace?.id, params.documentId);

	useEffect(() => {
		let client: yorkie.Client;
		let doc: yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>;
		const yorkieDocuentId = document?.yorkieDocumentId;

		if (!yorkieDocuentId) return;

		const initializeYorkie = async () => {
			client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
			});
			await client.activate();

			doc = new yorkie.Document(yorkieDocuentId as string);

			await client.attach(doc, {
				initialPresence: {
					name: userStore.data?.nickname as string,
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
				if (client.isActive()) {
					await client.detach(doc);
					await client.deactivate();
				}

				dispatch(setDoc(null));
				dispatch(setClient(null));
			};

			cleanUp();
		};
	}, [dispatch, document?.yorkieDocumentId, userStore.data?.nickname]);

	return (
		<Box height="calc(100% - 64px)">
			<DocumentView />
		</Box>
	);
}

export default DocumentIndex;
