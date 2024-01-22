export class Document {
	id: string;
	yorkieDocumentId: string;
	title: string;
	slug: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetWorkspaceDocumentListResponse {
	cursor: string | null;
	documents: Array<Workspace>;
}
