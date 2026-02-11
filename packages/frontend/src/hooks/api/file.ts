import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
	CreateUploadUrlRequest,
	CreateUploadUrlResponse,
	ExportFileRequest,
	UploadFileRequest,
} from "./types/file";

export const useCreateUploadUrlMutation = () => {
	return useMutation({
		mutationFn: async (data: CreateUploadUrlRequest) => {
			const res = await axios.post<CreateUploadUrlResponse>(`/files`, data);

			return res.data;
		},
	});
};

export const useUploadFileMutation = () => {
	return useMutation({
		mutationFn: async (data: UploadFileRequest) => {
			return axios.put<void>(data.url, new Blob([data.file]), {
				headers: {
					Authorization: undefined,
					"Content-Type": data.file.type,
				},
			});
		},
	});
};

export const useExportFileMutation = () => {
	return useMutation({
		mutationFn: async (data: ExportFileRequest) => {
			const { exportType, content, fileName } = data;

			const res = await axios.post(
				"/files/export-markdown",
				{
					exportType,
					content,
					fileName,
				},
				{
					responseType: "blob",
					headers: {
						Accept: "application/octet-stream",
					},
				}
			);

			return res;
		},
	});
};
