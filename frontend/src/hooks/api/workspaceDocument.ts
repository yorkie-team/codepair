import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
	CreateDocumentRequest,
	CreateDocumentResponse,
	GetWorkspaceDocumentListResponse,
} from "./types/workspaceDocument";

export const generateGetWorkspaceDocumentListQueryKey = (workspaceId: string) => {
	return ["workspaces", workspaceId, "documents"];
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
