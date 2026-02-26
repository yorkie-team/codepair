import { useSnackbar } from "notistack";
import { useCallback } from "react";

interface CustomError extends Error {
	response?: {
		data: {
			error: string;
			message?: string;
			statusCode: number;
		};
	};
}

export function useErrorHandler() {
	const { enqueueSnackbar } = useSnackbar();
	const handleError = useCallback(
		(error: CustomError) => {
			enqueueSnackbar(
				error.response?.data.message || error.message || "Something went wrong...",
				{ variant: "error" }
			);
		},
		[enqueueSnackbar]
	);

	return handleError;
}
