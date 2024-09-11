import Color from "color";
import randomColor from "randomcolor";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import * as yorkie from "yorkie-js-sdk";
import { selectAuth } from "../store/authSlice";
import { CodePairDocType } from "../store/editorSlice";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";

const YORKIE_API_ADDR = import.meta.env.VITE_YORKIE_API_ADDR;
const YORKIE_API_KEY = import.meta.env.VITE_YORKIE_API_KEY;

yorkie.setLogLevel(4);

export const useYorkieDocument = (
	yorkieDocumentId?: string | null,
	presenceName?: string | null
) => {
	const [searchParams] = useSearchParams();
	const authStore = useSelector(selectAuth);
	const [client, setClient] = useState<yorkie.Client | null>(null);
	const [doc, setDoc] = useState<CodePairDocType | null>(null);

	const getYorkieToken = useCallback(() => {
		const shareToken = searchParams.get("token");
		return shareToken ? `share:${shareToken}` : `default:${authStore.accessToken}`;
	}, [authStore.accessToken, searchParams]);

	const createYorkieClient = useCallback(async (yorkieToken: string) => {
		const newClient = new yorkie.Client(YORKIE_API_ADDR, {
			apiKey: YORKIE_API_KEY,
			token: yorkieToken,
		});
		await newClient.activate();
		return newClient;
	}, []);

	const createYorkieDocument = useCallback(
		(client: yorkie.Client, yorkieDocumentId: string, presenceName: string) => {
			const newDocument = new yorkie.Document<
				YorkieCodeMirrorDocType,
				YorkieCodeMirrorPresenceType
			>(yorkieDocumentId, { enableDevtools: true });
			return client.attach(newDocument, {
				initialPresence: {
					name: presenceName,
					color: Color(randomColor()).fade(0.15).toString(),
					selection: null,
					cursor: null,
				},
			});
		},
		[]
	);

	const cleanUpYorkieDocument = useCallback(async () => {
		if (!client || !doc) return;

		try {
			await client.detach(doc);
			await client.deactivate();
		} catch (error) {
			console.error("Error during Yorkie cleanup:", error);
		}
	}, [client, doc]);

	useEffect(() => {
		let mounted = true;
		if (!yorkieDocumentId || !presenceName || doc || client) return;

		const initializeYorkie = async () => {
			try {
				const yorkieToken = getYorkieToken();
				const newClient = await createYorkieClient(yorkieToken);
				const newDoc = await createYorkieDocument(
					newClient,
					yorkieDocumentId,
					presenceName
				);

				// Clean up if the component is unmounted before the initialization is done
				if (!mounted) {
					await newClient.detach(newDoc);
					await newClient.deactivate();
					return;
				}

				setClient(newClient);
				setDoc(newDoc);
			} catch (error) {
				console.error("Error initializing Yorkie: ", error);
			}
		};

		initializeYorkie();

		return () => {
			mounted = false;
		};
	}, [
		presenceName,
		yorkieDocumentId,
		doc,
		client,
		getYorkieToken,
		createYorkieClient,
		createYorkieDocument,
	]);

	useEffect(() => {
		return () => {
			cleanUpYorkieDocument();
		};
	}, [cleanUpYorkieDocument]);

	return { client, doc };
};
