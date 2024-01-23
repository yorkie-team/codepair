import { ShareRole } from "../../../utils/share";

export class Document {
	id: string;
	workspaceId: string;
	yorkieDocumentId: string;
	title: string;
	slug: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetDocumentResponse extends Document {}

export class GetDocumentBySharingTokenResponse extends Document {
	role: ShareRole;
}
