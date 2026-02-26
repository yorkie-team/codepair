import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CheckNameConflictRequest, CheckNameConflictResponse } from "./types/check";

export const generateCheckNameConflictQueryKey = (name: string) => {
	return ["check", "name-conflict", name];
};

export const useCheckNameConflictQuery = (name: string | null) => {
	const query = useQuery({
		queryKey: generateCheckNameConflictQueryKey(name || ""),
		enabled: Boolean(name),
		queryFn: async () => {
			const res = await axios.post<CheckNameConflictResponse>("/check/name-conflict", {
				name,
			} as CheckNameConflictRequest);
			return res.data;
		},
	});

	return query;
};
