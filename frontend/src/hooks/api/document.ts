import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetDocumentBySharingTokenResponse, GetDocumentResponse } from "./types/document";

export const generateGetDocumentQueryKey = (documentSlug: string) => {
	return ["documents", documentSlug];
};

export const generateGetDocumentBySharingTokenQueryKey = (sharingToken: string) => {
	return ["documents", "share", sharingToken];
};

export const useGetDocumentQuery = (documentSlug?: string | null) => {
	const query = useQuery({
		queryKey: generateGetDocumentQueryKey(documentSlug || ""),
		enabled: Boolean(documentSlug),
		queryFn: async () => {
			const res = await axios.get<GetDocumentResponse>(`/documents/${documentSlug}`);
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or unauthorized document.",
		},
	});

	return query;
};

export const useGetDocumentBySharingTokenQuery = (sharingToken?: string | null) => {
	const query = useQuery({
		queryKey: generateGetDocumentQueryKey(sharingToken || ""),
		enabled: Boolean(sharingToken),
		queryFn: async () => {
			const res = await axios.get<GetDocumentBySharingTokenResponse>("/documents/share", {
				params: {
					token: sharingToken,
				},
			});
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or expired document.",
		},
	});

	return query;
};
