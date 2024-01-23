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

export class CreateWorkspaceInviteTokenRequest {
	expiredAt: Date | null;
}

export class CreateWorkspaceInviteTokenResponse {
	invitationToken: string;
}

export class JoinWorkspaceRequest {
	invitationToken: string;
}

export class JoinWorkspaceResponse extends Workspace {}
