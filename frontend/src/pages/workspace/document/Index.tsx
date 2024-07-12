import { useEffect } from "react";
import { setClient, setDoc } from "../../../store/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { useGetDocumentQuery } from "../../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../../hooks/api/workspace";
import DocumentView from "../../../components/editor/DocumentView";
import { useYorkieDocument } from "../../../hooks/useYorkieDocument";
import YorkieIntelligence from "../../../components/editor/YorkieIntelligence";
import { selectSetting } from "../../../store/settingSlice";

function DocumentIndex() {
	const dispatch = useDispatch();
	const params = useParams();
	const userStore = useSelector(selectUser);
	const settingStore = useSelector(selectSetting);
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const { data: document } = useGetDocumentQuery(workspace?.id, params.documentId);
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

	return (
		<Box height="calc(100% - 64px)">
			<DocumentView />
			{settingStore.yorkieIntelligence?.enable && <YorkieIntelligence />}
		</Box>
	);
}

export default DocumentIndex;
