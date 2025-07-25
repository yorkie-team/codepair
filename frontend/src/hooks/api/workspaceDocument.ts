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

import { useEffect } from "react";
import { setDocumentData } from "../../store/documentSlice";
import { UpdateDocumentRequest } from "./types/document";
import { useDispatch } from "react-redux";

export const generateWorkspaceDocumentListQueryKey = (workspaceId: string, search?: string) => [
	"workspaces",
	workspaceId,
	"documents",
	{ search: search ?? "" },
];

export const generateWorkspaceDocumentQueryKey = (workspaceId: string, documentId: string) => [
	"workspaces",
	workspaceId,
	"documents",
	documentId,
];

export const useGetWorkspaceDocumentListQuery = (workspaceId?: string, search?: string) => {
	const query = useInfiniteQuery<GetWorkspaceDocumentListResponse>({
		queryKey: generateWorkspaceDocumentListQueryKey(workspaceId || "", search),
		queryFn: async ({ pageParam }) => {
			const res = await axios.get<GetWorkspaceDocumentListResponse>(
				`/workspaces/${workspaceId}/documents`,
				{
					params: {
						cursor: pageParam,
						page_size: 30,
						search,
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
	const dispatch = useDispatch();
	const query = useQuery({
		queryKey: generateWorkspaceDocumentQueryKey(workspaceId || "", documentId || ""),
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

	useEffect(() => {
		if (query.data) {
			dispatch(setDocumentData(query.data));
		}

		return () => {
			dispatch(setDocumentData(null));
		};
	}, [dispatch, query.data]);

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
				queryKey: generateWorkspaceDocumentListQueryKey(workspaceId),
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

export const useUpdateDocumentTitleMutation = (workspaceId: string, documentId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateDocumentRequest) => {
			const res = await axios.put<void>(
				`/workspaces/${workspaceId}/documents/${documentId}/`,
				data
			);

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: generateWorkspaceDocumentQueryKey(workspaceId, documentId),
			});
		},
	});
};
