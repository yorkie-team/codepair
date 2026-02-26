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

export class ExportFileRequest {
	exportType: string;
	content: string;
	fileName: string;
}
