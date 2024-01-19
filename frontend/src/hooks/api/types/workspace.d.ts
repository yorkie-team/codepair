export interface Workspace {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetWorkspaceResponse extends Workspace {}
