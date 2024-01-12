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

function EditorIndex() {
	const dispatch = useDispatch();

	console.log(import.meta.env);
	useEffect(() => {
		const initializeYorkie = async () => {
			const client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
			});
			await client.activate();

			const doc = new yorkie.Document<YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType>(
				"my-first-document"
			);

			console.log(Color(randomColor()).fade(0.15).toString());
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
	}, [dispatch]);

	return <Editor />;
}

export default EditorIndex;
