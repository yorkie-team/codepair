import { useState, useCallback, useEffect } from "react";
import { Client, Document, RevisionSummary, Indexable } from "@yorkie-js/sdk";
import { useSnackbar } from "notistack";

export interface UseYorkieRevisionsOptions<T, P extends Indexable> {
	client: Client | null;
	doc: Document<T, P> | null;
	enabled?: boolean;
}

export const useYorkieRevisions = <T, P extends Indexable>({
	client,
	doc,
	enabled = true,
}: UseYorkieRevisionsOptions<T, P>) => {
	const { enqueueSnackbar } = useSnackbar();
	const [revisions, setRevisions] = useState<Array<RevisionSummary>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Fetch revision list
	const fetchRevisions = useCallback(
		async (options?: { pageSize?: number; offset?: number; isForward?: boolean }) => {
			if (!client || !doc) return;

			setIsLoading(true);
			setError(null);

			try {
				const revs = await client.listRevisions(doc, {
					pageSize: options?.pageSize ?? 50,
					offset: options?.offset ?? 0,
					isForward: options?.isForward ?? false, // false = newest first
				});
				setRevisions(revs);
				return revs;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to fetch revisions");
				setError(error);
				enqueueSnackbar("Failed to load revision list", {
					variant: "error",
				});
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[client, doc, enqueueSnackbar]
	);

	// Create revision
	const createRevision = useCallback(
		async (label: string, description?: string) => {
			if (!client || !doc) {
				throw new Error("Client or document not available");
			}

			setIsLoading(true);
			setError(null);

			try {
				const revision = await client.createRevision(doc, label, description);
				enqueueSnackbar(`Revision "${label}" saved successfully`, {
					variant: "success",
				});

				// Refresh list
				await fetchRevisions();
				return revision;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to create revision");
				setError(error);
				enqueueSnackbar("Failed to save revision", {
					variant: "error",
				});
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[client, doc, enqueueSnackbar, fetchRevisions]
	);

	// Get revision detail (with snapshot)
	const getRevision = useCallback(
		async (revisionId: string) => {
			if (!client || !doc) {
				throw new Error("Client or document not available");
			}

			try {
				const revision = await client.getRevision(doc, revisionId);
				return revision;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to get revision");
				throw error;
			}
		},
		[client, doc]
	);

	// Restore revision
	const restoreRevision = useCallback(
		async (revisionId: string) => {
			if (!client || !doc) {
				throw new Error("Client or document not available");
			}

			setIsLoading(true);
			setError(null);

			try {
				await client.restoreRevision(doc, revisionId);
				await client.sync();

				enqueueSnackbar("Restored to previous revision", {
					variant: "success",
				});

				// Refresh list
				await fetchRevisions();
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to restore revision");
				setError(error);
				enqueueSnackbar("Failed to restore revision", {
					variant: "error",
				});
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[client, doc, enqueueSnackbar, fetchRevisions]
	);

	// Initial load
	useEffect(() => {
		if (enabled && client && doc) {
			fetchRevisions();
		}
	}, [enabled, client, doc, fetchRevisions]);

	return {
		revisions,
		isLoading,
		error,
		fetchRevisions,
		getRevision,
		createRevision,
		restoreRevision,
	};
};
