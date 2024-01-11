import { useEffect } from "react";
import Editor from "../../components/editor/Editor";
import * as yorkie from "yorkie-js-sdk";
import { setClient, setDoc } from "../../store/editorSlice";
import { useDispatch } from "react-redux";

function EditorIndex() {
	const dispatch = useDispatch();

	useEffect(() => {
		const initializeYorkie = async () => {
			const client = new yorkie.Client("https://api.yorkie.dev", {
				apiKey: "",
			});
			await client.activate();

			const doc = new yorkie.Document("my-first-document");

			await client.attach(doc, {
				initialPresence: {
					selection: null,
				},
			});
			dispatch(setDoc(doc));
			dispatch(setClient(client));
		};
		initializeYorkie();
	}, [dispatch]);

	return <Editor />;
}

export default EditorIndex;
