import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetWorkspaceUserListResponse } from "./types/workspaceUser";

export const generateGetWorkspaceUserListQueryKey = (workspaceId: string) => {
	return ["workspaces", workspaceId, "users"];
};

export const useGetWorkspaceUserListQuery = (workspaceId?: string) => {
	return useInfiniteQuery<GetWorkspaceUserListResponse>({
		queryKey: generateGetWorkspaceUserListQueryKey(workspaceId || ""),
		queryFn: async ({ pageParam }) => {
			const res = await axios.get<GetWorkspaceUserListResponse>(
				`/workspaces/${workspaceId}/users`,
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
};
