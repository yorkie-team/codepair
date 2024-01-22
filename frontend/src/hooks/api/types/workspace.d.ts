export class Workspace {
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

export class CreateWorkspaceRequest {
	title: string;
}

export class CreateWorkspaceResponse extends Workspace {}
