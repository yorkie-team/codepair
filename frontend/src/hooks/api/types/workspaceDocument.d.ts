import { Document } from "./document";

export class GetWorkspaceDocumentListResponse {
	cursor: string | null;
	totalLength: number;
	documents: Array<Document>;
}

export class GetWorkspaceDocumentResponse extends Document {}

export class CreateDocumentRequest {
	title: string;
}

export class CreateDocumentResponse extends Document {}

export class CreateDocumentShareTokenRequest {
	role: ShareRole;
	expiredAt: Date | null;
}

export class CreateDocumentShareTokenResponse {
	sharingToken: string;
}
