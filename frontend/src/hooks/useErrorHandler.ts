import { useCallback } from "react";

export function useErrorHandler() {
	const handleError = useCallback((error: Error) => {}, []);

	return handleError;
}
