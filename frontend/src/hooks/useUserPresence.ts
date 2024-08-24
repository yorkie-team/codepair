import { useEffect, useState } from "react";
import { ActorID } from "yorkie-js-sdk";
import { CodePairDocType } from "../store/editorSlice";
import { YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";

export type Presence = {
	clientID: ActorID;
	presence: YorkieCodeMirrorPresenceType;
};

export const useUserPresence = (doc: CodePairDocType | null) => {
	const [presenceList, setPresenceList] = useState<Presence[]>([]);

	useEffect(() => {
		if (!doc) return;

		const updatePresences = () => setPresenceList(doc.getPresences() ?? []);

		updatePresences();

		const unsubscribe = doc.subscribe("others", (event) => {
			if (event.type === "presence-changed" || event.type === "watched") {
				updatePresences();
			}

			if (event.type === "unwatched") {
				setPresenceList((prev) =>
					prev.filter((presence) => presence.clientID !== event.value.clientID)
				);
			}
		});

		return () => {
			unsubscribe();
			setPresenceList([]);
		};
	}, [doc]);

	return { presenceList };
};
