import { useEffect } from "react";
import { useList } from "react-use";
import { ActorID } from "yorkie-js-sdk";
import { CodePairDocType } from "../store/editorSlice";
import { YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";

export type Presence = {
	clientID: ActorID;
	presence: YorkieCodeMirrorPresenceType;
};

export const useUserPresence = (doc: CodePairDocType | null) => {
	const [
		presenceList,
		{ set: setPresenceList, clear: clearPresenceList, filter: filterPresenceList },
	] = useList<Presence>([]);

	useEffect(() => {
		if (!doc) return;

		setPresenceList(doc.getPresences());

		const unsubscribe = doc.subscribe("others", (event) => {
			if (event.type === "watched") {
				setPresenceList(doc.getPresences() ?? []);
			}

			if (event.type === "unwatched") {
				filterPresenceList((presence) => presence.clientID !== event.value.clientID);
			}
		});

		return () => {
			unsubscribe();
			clearPresenceList();
		};
	}, [doc, clearPresenceList, setPresenceList, filterPresenceList]);

	return { presenceList };
};
