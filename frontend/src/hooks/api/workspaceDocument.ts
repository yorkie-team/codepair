import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetWorkspaceDocumentListResponse } from "./types/workspaceDocument";

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
