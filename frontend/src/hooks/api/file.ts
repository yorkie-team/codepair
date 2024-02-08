import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CreateUploadUrlRequest, CreateUploadUrlResponse } from "./types/file";

export const useCreateUploadUrlMutation = () => {
	return useMutation({
		mutationFn: async (data: CreateUploadUrlRequest) => {
			const res = await axios.post<CreateUploadUrlResponse>(`/files`, data);

			return res.data;
		},
	});
};
