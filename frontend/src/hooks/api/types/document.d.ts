import { ShareRole } from "../../../utils/share";

export class Document {
	id: string;
	workspaceId: string;
	yorkieDocumentId: string;
	title: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetDocumentBySharingTokenResponse extends Document {
	role: ShareRole;
}

export class UpdateDocumentRequest {
	title: string;
}
