import Color from "color";
import randomColor from "randomcolor";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useBeforeUnload, useSearchParams } from "react-router-dom";
import * as yorkie from "yorkie-js-sdk";
import { selectAuth } from "../store/authSlice";
import { CodePairDocType } from "../store/editorSlice";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";
import { useRefreshTokenMutation } from "./api/user";
import { selectUser } from "../store/userSlice";

const YORKIE_API_ADDR = import.meta.env.VITE_YORKIE_API_ADDR;
const YORKIE_API_KEY = import.meta.env.VITE_YORKIE_API_KEY;

yorkie.setLogLevel(4);

export const useYorkieDocument = (
	yorkieDocumentId?: string | null,
	presenceName?: string | null
) => {
	const [searchParams] = useSearchParams();
	const authStore = useSelector(selectAuth);
	const userStore = useSelector(selectUser);
	const [client, setClient] = useState<yorkie.Client | null>(null);
	const [doc, setDoc] = useState<CodePairDocType | null>(null);
	const { mutateAsync: mutateRefreshToken } = useRefreshTokenMutation();
	const userID = userStore.data?.id || "";

	const getYorkieToken = useCallback(
		async (reason?: string) => {
			const shareToken = searchParams.get("token");
			let accessToken = authStore.accessToken;
			const isShare = Boolean(shareToken);

			if (reason) {
				if (isShare) {
					throw new Error("Cannot refresh token for shared documents");
				} else {
					try {
						accessToken = await mutateRefreshToken();
					} catch {
						throw new Error("Failed to refresh token");
					}
				}
			}

			return isShare ? `share:${shareToken}` : `default:${accessToken}`;
		},
		[authStore.accessToken, mutateRefreshToken, searchParams]
	);

	const createYorkieClient = useCallback(async () => {
		const syncLoopDuration = Number(searchParams.get("syncLoopDuration")) || 200;
		const opts = {
			apiKey: YORKIE_API_KEY,
			authTokenInjector: getYorkieToken,
			syncLoopDuration,
		} as yorkie.ClientOptions;
		if (userID) {
			opts.metadata = { userID };
		}

		const newClient = new yorkie.Client(YORKIE_API_ADDR, opts);
		await newClient.activate();
		return newClient;
	}, [getYorkieToken, searchParams, userID]);

	const createYorkieDocument = useCallback(
		(client: yorkie.Client, yorkieDocumentId: string, presenceName: string) => {
			const newDocument = new yorkie.Document<
				YorkieCodeMirrorDocType,
				YorkieCodeMirrorPresenceType
			>(yorkieDocumentId, { enableDevtools: false });
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
			await client.deactivate({ keepalive: true });
		} catch (error) {
			console.error("Error during Yorkie cleanup:", error);
		}
	}, [client, doc]);

	useEffect(() => {
		let mounted = true;
		if (!yorkieDocumentId || !presenceName || doc || client) return;

		const initializeYorkie = async () => {
			try {
				const newClient = await createYorkieClient();
				const newDoc = await createYorkieDocument(
					newClient,
					yorkieDocumentId,
					presenceName
				);

				// Clean up if the component is unmounted before the initialization is done
				if (!mounted) {
					await newClient.deactivate({ keepalive: true });
					return;
				}

				setClient(newClient);
				setDoc(newDoc);
				// Expose the document to the window for debugging purposes
				window.doc = newDoc;
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

	// Clean up yorkie document on unmount
	// For example, when the user navigates to a different page
	useEffect(() => {
		return () => {
			cleanUpYorkieDocument();
		};
	}, [cleanUpYorkieDocument]);

	// Clean up yorkie document on beforeunload
	// For example, when the user closes the tab or refreshes the page
	useBeforeUnload(cleanUpYorkieDocument);

	return { client, doc };
};
