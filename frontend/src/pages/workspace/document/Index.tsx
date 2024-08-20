import { useEffect } from "react";
import { setClient, setDoc } from "../../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import { Backdrop, Box, CircularProgress } from "@mui/material";
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
	const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspaceQuery(
		params.workspaceSlug
	);
	const { data: document, isLoading: isDocumentLoading } = useGetDocumentQuery(
		workspace?.id,
		params.documentId
	);
	const { doc, client } = useYorkieDocument(document?.yorkieDocumentId, userStore.data?.nickname);

	useEffect(() => {
		if (!doc || !client) return;

		dispatch(setDoc(doc));
		dispatch(setClient(client));

		return () => {
			dispatch(setDoc(null));
			dispatch(setClient(null));
		};
	}, [dispatch, client, doc]);

	if (isDocumentLoading || isWorkspaceLoading) {
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);
	}

	return (
		<Box height="calc(100% - 64px)">
			<DocumentView />
		</Box>
	);
}

export default DocumentIndex;
