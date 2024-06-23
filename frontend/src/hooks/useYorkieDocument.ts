import { useCallback, useEffect, useState } from "react";
import * as yorkie from "yorkie-js-sdk";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";
import Color from "color";
import randomColor from "randomcolor";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/authSlice";

yorkie.setLogLevel(4);

export const useYorkieDocument = (
	yorkieDocuentId?: string | null,
	presenceName?: string | null
) => {
	const [searchParams] = useSearchParams();
	const authStore = useSelector(selectAuth);
	const [client, setClient] = useState<yorkie.Client | null>(null);
	const [doc, setDoc] = useState<yorkie.Document<
		YorkieCodeMirrorDocType,
		YorkieCodeMirrorPresenceType
	> | null>(null);
	const cleanUpYorkieDocument = useCallback(async () => {
		if (!client || !doc) return;

		await client?.detach(doc);
		await client?.deactivate();
	}, [client, doc]);

	useEffect(() => {
		let mounted = true;
		if (!yorkieDocuentId || !presenceName || doc || client) return;

		let yorkieToken = `default:${authStore.accessToken}`;

		if (searchParams.get("token")) {
			yorkieToken = `share:${searchParams.get("token")}`;
		}

		const initializeYorkie = async () => {
			const newClient = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
				apiKey: import.meta.env.VITE_YORKIE_API_KEY,
				token: yorkieToken,
			});
			await newClient.activate();

			const newDoc = new yorkie.Document<
				YorkieCodeMirrorDocType,
				YorkieCodeMirrorPresenceType
			>(yorkieDocuentId);

			await newClient.attach(newDoc, {
				initialPresence: {
					name: presenceName,
					color: Color(randomColor()).fade(0.15).toString(),
					selection: null,
				},
			});

			// Clean up if the component is unmounted before the initialization is done
			if (!mounted) {
				await newClient.detach(newDoc);
				await newClient.deactivate();
				return;
			}

			setClient(newClient);
			setDoc(newDoc);
		};
		initializeYorkie();

		return () => {
			mounted = false;
		};
	}, [presenceName, yorkieDocuentId, doc, client, authStore.accessToken, searchParams]);

	useEffect(() => {
		return () => {
			cleanUpYorkieDocument();
		};
	}, [cleanUpYorkieDocument]);

	return { client, doc };
};
