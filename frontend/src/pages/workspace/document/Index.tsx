import { useEffect } from "react";
import * as yorkie from "yorkie-js-sdk";
import { setClient, setDoc } from "../../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { useGetDocumentQuery } from "../../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../../hooks/api/workspace";
import DocumentView from "../../../components/editor/DocumentView";
import { useYorkieDocument } from "../../../hooks/useYorkieDocument";

function DocumentIndex() {
	const dispatch = useDispatch();
	const params = useParams();
	const userStore = useSelector(selectUser);
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const { data: document } = useGetDocumentQuery(workspace?.id, params.documentId);
	const { doc, client, cleanUpYorkieDocument } = useYorkieDocument(
		document?.yorkieDocumentId,
		userStore.data?.nickname
	);

	useEffect(() => {
		if (!doc || !client) return;

		dispatch(setDoc(doc));
		dispatch(setClient(client));

		return () => {
			cleanUpYorkieDocument();
			dispatch(setDoc(null));
			dispatch(setClient(null));
		};
	}, [cleanUpYorkieDocument, dispatch, client, doc]);

	return (
		<Box height="calc(100% - 64px)">
			<DocumentView />
		</Box>
	);
}

export default DocumentIndex;
