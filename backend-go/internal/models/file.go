package models

type CreateUploadPresignedUrlRequest struct {
	WorkspaceID   string `json:"workspaceId"`
	ContentLength int64  `json:"contentLength"`
	ContentType   string `json:"contentType"`
}

type CreateUploadPresignedUrlResponse struct {
	URL     string `json:"url"`
	FileKey string `json:"fileKey"`
}

type ExportFileRequest struct {
	ExportType string `json:"exportType"`
	Content    string `json:"content"`
	FileName   string `json:"fileName"`
}

type ExportFileResponse struct {
	FileContent []byte `json:"fileContent"`
	MimeType    string `json:"mimeType"`
	FileName    string `json:"fileName"`
}
