export const getLastWorkspaceKey = (userId: string) => `cp:last-workspace:${userId}`;

export const getLastWorkspaceSlug = (userId?: string | null): string | null => {
	if (!userId) return null;
	try {
		const slug = localStorage.getItem(getLastWorkspaceKey(userId));
		return slug || null;
	} catch {
		return null;
	}
};

export const setLastWorkspaceSlug = (userId?: string | null, slug?: string | null) => {
	if (!userId || !slug) return;
	try {
		localStorage.setItem(getLastWorkspaceKey(userId), slug);
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn("Failed to persist last workspace slug", error);
		}
	}
};

export const clearLastWorkspaceSlug = (userId?: string | null) => {
	if (!userId) return;
	try {
		localStorage.removeItem(getLastWorkspaceKey(userId));
	} catch (error) {
		if (import.meta.env.DEV) {
			console.warn("Failed to clear last workspace slug", error);
		}
	}
};
