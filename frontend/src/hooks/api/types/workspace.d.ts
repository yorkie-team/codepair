export interface Workspace {
	id: string;
	title: string;
	slug: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetWorkspaceResponse extends Workspace {}

export class GetWorkspaceListResponse {
	cursor: string | null;
	workspaces: Array<Workspace>;
}
