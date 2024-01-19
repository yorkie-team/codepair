import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetWorkspaceListResponse, GetWorkspaceResponse } from "./types/workspace";

export const generateGetWorkspaceQueryKey = (workspaceId: string) => {
	return ["workspaces", workspaceId];
};

export const generateGetWorkspaceListQueryKey = () => {
	return ["workspaces"];
};

export const useGetWorkspaceQuery = (workspaceId?: string) => {
	const query = useQuery({
		queryKey: generateGetWorkspaceQueryKey(workspaceId || ""),
		enabled: Boolean(workspaceId),
		queryFn: async () => {
			const res = await axios.get<GetWorkspaceResponse>(`/workspaces/${workspaceId}`);
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or unauthorized Workspace.",
		},
	});

	return query;
};

export const useGetWorkspaceListQuery = () => {
	const query = useInfiniteQuery<GetWorkspaceListResponse>({
		queryKey: generateGetWorkspaceListQueryKey(),
		queryFn: async ({ pageParam }) => {
			const res = await axios.get<GetWorkspaceListResponse>("/workspaces", {
				params: {
					cursor: pageParam,
				},
			});
			return res.data;
		},
		initialPageParam: undefined,
		getPreviousPageParam: (firstPage) => firstPage.cursor ?? undefined,
		getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
	});

	return query;
};
