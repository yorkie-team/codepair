import { ShareRole } from "../../../utils/share";

export class Document {
	id: string;
	workspaceId: string;
	yorkieDocumentId: string;
	title: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
	presences?: Record<
		string,
		{
			data: {
				color: string;
				cursor: string | null;
				name: string;
				profileIcon?: string | null;
				selection: string | null;
			};
		}
	>;
}

export class GetDocumentBySharingTokenResponse extends Document {
	role: ShareRole;
}

export class UpdateDocumentRequest {
	title: string;
}
