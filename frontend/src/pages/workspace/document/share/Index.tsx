import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import DocumentView from "../../../../components/editor/DocumentView";
import { useGetDocumentBySharingTokenQuery } from "../../../../hooks/api/document";
import { useYorkieDocument } from "../../../../hooks/useYorkieDocument";
import {
	EditorModeType,
	setClient,
	setDoc,
	setMode,
	setShareRole,
} from "../../../../store/editorSlice";
import { selectUser } from "../../../../store/userSlice";
import { ShareRole } from "../../../../utils/share";

function DocumentShareIndex() {
	const dispatch = useDispatch();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const userStore = useSelector(selectUser);
	const shareToken = useMemo(() => searchParams.get("token"), [searchParams]);
	const { data: sharedDocument } = useGetDocumentBySharingTokenQuery(shareToken);
	const { doc, client } = useYorkieDocument(
		sharedDocument?.yorkieDocumentId,
		userStore.data?.nickname ?? "Anonymous"
	);

	useEffect(() => {
		if (!sharedDocument?.role) return;

		dispatch(setShareRole(sharedDocument.role));

		if (sharedDocument.role === ShareRole.READ) {
			dispatch(setMode(EditorModeType.READ));
		}
	}, [dispatch, sharedDocument?.role]);

	useEffect(() => {
		if (!doc || !client) return;

		dispatch(setDoc(doc));
		dispatch(setClient(client));

		return () => {
			dispatch(setDoc(null));
			dispatch(setClient(null));
		};
	}, [dispatch, client, doc]);

	if (!shareToken) return <Navigate to="/" state={{ from: location }} replace />;

	return (
		<Box height="calc(100% - 64px)">
			<DocumentView />
		</Box>
	);
}

export default DocumentShareIndex;
