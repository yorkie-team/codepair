import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetDocumentBySharingTokenResponse } from "./types/document";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setDocumentData } from "../../store/documentSlice";

export const generateGetDocumentBySharingTokenQueryKey = (sharingToken: string) => {
	return ["documents", "share", sharingToken];
};

export const useGetDocumentBySharingTokenQuery = (sharingToken?: string | null) => {
	const dispatch = useDispatch();
	const query = useQuery({
		queryKey: generateGetDocumentBySharingTokenQueryKey(sharingToken || ""),
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
