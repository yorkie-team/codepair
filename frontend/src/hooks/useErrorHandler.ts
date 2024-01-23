import { useSnackbar } from "notistack";
import { useCallback } from "react";

export function useErrorHandler() {
	const { enqueueSnackbar } = useSnackbar();
	const handleError = useCallback((error: Error) => {
		enqueueSnackbar(error.message || "Something went wrong...", { variant: "error" });
	}, []);

	return handleError;
}
