import { Box } from "yorkie-ui";
import DocumentView from "../../../../components/editor/DocumentView";
import { useGetDocumentBySharingTokenQuery } from "../../../../hooks/api/document";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useYorkieDocument } from "../../../../hooks/useYorkieDocument";
import { useDispatch } from "react-redux";
import { setClient, setDoc, setMode, setShareRole } from "../../../../store/editorSlice";

function DocumentShareIndex() {
	const dispatch = useDispatch();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const shareToken = useMemo(() => searchParams.get("token"), [searchParams]);
	const { data: sharedDocument } = useGetDocumentBySharingTokenQuery(shareToken);
	const { doc, client, cleanUpYorkieDocument } = useYorkieDocument(
		sharedDocument?.yorkieDocumentId,
		"Anonymous"
	);

	useEffect(() => {
		if (!sharedDocument?.role) return;

		dispatch(setShareRole(sharedDocument.role));

		if (sharedDocument.role === "READ") {
			dispatch(setMode("read"));
		}
	}, [dispatch, sharedDocument?.role]);

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

	if (!shareToken) return <Navigate to="/" state={{ from: location }} replace />;

	return (
		<Box
			style={{
				height: "calc(100% - 64px)",
			}}
		>
			<DocumentView />
		</Box>
	);
}

export default DocumentShareIndex;
