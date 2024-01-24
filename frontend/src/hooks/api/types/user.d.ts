export interface User {
	id: string;
	nickname?: string | null;
	lastWorkspaceSlug?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class GetUserResponse extends User {}
