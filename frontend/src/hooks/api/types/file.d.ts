export class CreateUploadUrlRequest {
	workspaceId: string;
	contentLength: number;
	contentType: string;
}

export class CreateUploadUrlResponse {
	url: string;
	fileKey: string;
}

export class UploadFileRequest {
	url: string;
	file: File;
}
