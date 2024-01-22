export interface User {
	id: string;
	nickname: string;
	lastWorkspaceSlug: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetUserResponse extends User {}
