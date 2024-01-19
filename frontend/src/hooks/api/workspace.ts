import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetWorkspaceResponse } from "./types/workspace";

export const generateGetWorkspaceQueryKey = (workspaceId: string) => {
	return ["workspaces", workspaceId];
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
