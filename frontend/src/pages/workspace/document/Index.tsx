import { useEffect } from "react";
import { setClient, setDoc } from "../../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "yorkie-ui";
import { useParams } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { useGetDocumentQuery } from "../../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../../hooks/api/workspace";
import DocumentView from "../../../components/editor/DocumentView";
import { useYorkieDocument } from "../../../hooks/useYorkieDocument";
import YorkieIntelligence from "../../../components/editor/YorkieIntelligence";

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
		<Box
			style={{
				height: "calc(100% - 64px)",
			}}
		>
			<DocumentView />
			<YorkieIntelligence />
		</Box>
	);
}

export default DocumentIndex;
