import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
	CreateWorkspaceInviteTokenRequest,
	CreateWorkspaceInviteTokenResponse,
	CreateWorkspaceRequest,
	CreateWorkspaceResponse,
	GetWorkspaceListResponse,
	GetWorkspaceResponse,
	JoinWorkspaceRequest,
	JoinWorkspaceResponse,
	UpdateWorkspaceOrderRequest,
} from "./types/workspace";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setWorkspaceData } from "../../store/workspaceSlice";

export const generateGetWorkspaceQueryKey = (workspaceSlug: string) => {
	return ["workspaces", workspaceSlug];
};

export const generateGetWorkspaceListQueryKey = () => {
	return ["workspaces"];
};

export const useGetWorkspaceQuery = (workspaceSlug?: string) => {
	const dispatch = useDispatch();
	const query = useQuery({
		queryKey: generateGetWorkspaceQueryKey(workspaceSlug || ""),
		enabled: Boolean(workspaceSlug),
		queryFn: async () => {
			const res = await axios.get<GetWorkspaceResponse>(`/workspaces/${workspaceSlug}`);
			return res.data;
		},
		meta: {
			errorMessage: "This is a non-existent or unauthorized Workspace.",
		},
	});

	useEffect(() => {
		if (query.data) {
			dispatch(setWorkspaceData(query.data));
		}

		return () => {
			dispatch(setWorkspaceData(null));
		};
	}, [dispatch, query.data]);

	return query;
};

export const useGetWorkspaceListQuery = () => {
	const query = useQuery<GetWorkspaceListResponse>({
		queryKey: generateGetWorkspaceListQueryKey(),
		queryFn: async () => {
			const res = await axios.get<GetWorkspaceListResponse>("/workspaces");
			return res.data;
		},
	});

	return query;
};

export const useCreateWorkspaceMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateWorkspaceRequest) => {
			const res = await axios.post<CreateWorkspaceResponse>("/workspaces", data);

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: generateGetWorkspaceListQueryKey(),
			});
		},
	});
};

export const useCreateWorkspaceInvitationTokenMutation = (workspaceId: string) => {
	return useMutation({
		mutationFn: async (data: CreateWorkspaceInviteTokenRequest) => {
			const res = await axios.post<CreateWorkspaceInviteTokenResponse>(
				`/workspaces/${workspaceId}/invite-token`,
				data
			);

			return res.data;
		},
	});
};

export const useJoinWorkspaceMutation = () => {
	return useMutation({
		mutationFn: async (data: JoinWorkspaceRequest) => {
			const res = await axios.post<JoinWorkspaceResponse>("/workspaces/join", data);

			return res.data;
		},
	});
};

export const useUpdateWorkspaceOrderMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateWorkspaceOrderRequest) => {
			const res = await axios.patch<void>("/workspaces/order", data);

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: generateGetWorkspaceListQueryKey(),
			});
		},
	});
};
