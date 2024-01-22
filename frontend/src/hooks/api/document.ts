import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetDocumentResponse } from "./types/document";

export const generateGetDocumentQueryKey = (documentSlug: string) => {
	return ["documents", documentSlug];
};

export const useGetDocumentQuery = (documentSlug: string) => {
	const query = useQuery({
		queryKey: generateGetDocumentQueryKey(documentSlug || ""),
		enabled: Boolean(documentSlug),
		queryFn: async () => {
			const res = await axios.get<GetDocumentResponse>(`/documents/${documentSlug}`);
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or unauthorized Workspace.",
		},
	});

	return query;
};
