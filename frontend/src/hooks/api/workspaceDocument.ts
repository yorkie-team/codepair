import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
	CreateDocumentRequest,
	CreateDocumentResponse,
	CreateDocumentShareTokenRequest,
	CreateDocumentShareTokenResponse,
	GetWorkspaceDocumentResponse,
	GetWorkspaceDocumentListResponse,
} from "./types/workspaceDocument";

export const generateGetWorkspaceDocumentListQueryKey = (workspaceId: string) => {
	return ["workspaces", workspaceId, "documents"];
};

export const generateGetDocumentQueryKey = (workspaceId: string, documentId: string) => {
	return ["workpsaces", workspaceId, "documents", documentId];
};

export const useGetWorkspaceDocumentListQuery = (workspaceId?: string) => {
	const query = useInfiniteQuery<GetWorkspaceDocumentListResponse>({
		queryKey: generateGetWorkspaceDocumentListQueryKey(workspaceId || ""),
		queryFn: async ({ pageParam }) => {
			const res = await axios.get<GetWorkspaceDocumentListResponse>(
				`/workspaces/${workspaceId}/documents`,
				{
					params: {
						cursor: pageParam,
						page_size: 20,
					},
				}
			);
			return res.data;
		},
		enabled: Boolean(workspaceId),
		initialPageParam: undefined,
		getPreviousPageParam: (firstPage) => firstPage.cursor ?? undefined,
		getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
	});

	return query;
};

export const useGetDocumentQuery = (workspaceId?: string | null, documentId?: string | null) => {
	const query = useQuery({
		queryKey: generateGetDocumentQueryKey(workspaceId || "", documentId || ""),
		enabled: Boolean(workspaceId && documentId),
		queryFn: async () => {
			const res = await axios.get<GetWorkspaceDocumentResponse>(
				`/workspaces/${workspaceId}/documents/${documentId}`
			);
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or unauthorized document.",
		},
	});

	return query;
};

export const useCreateDocumentMutation = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateDocumentRequest) => {
			const res = await axios.post<CreateDocumentResponse>(
				`/workspaces/${workspaceId}/documents`,
				data
			);

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: generateGetWorkspaceDocumentListQueryKey(workspaceId),
			});
		},
	});
};

export const useCreateWorkspaceSharingTokenMutation = (workspaceId: string, documentId: string) => {
	return useMutation({
		mutationFn: async (data: CreateDocumentShareTokenRequest) => {
			const res = await axios.post<CreateDocumentShareTokenResponse>(
				`/workspaces/${workspaceId}/documents/${documentId}/share-token`,
				data
			);

			return res.data;
		},
	});
};
