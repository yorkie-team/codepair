package dto

type ExportFileRequest struct {
	ExportType string `json:"exportType"`
	Content    string `json:"content"`
	FileName   string `json:"fileName"`
}

type CreateUploadPresignedUrlRequest struct {
	WorkspaceID   string `json:"workspaceId"`
	ContentLength int64  `json:"contentLength"`
	ContentType   string `json:"contentType"`
}

type UploadRequest struct {
	WorkspaceID   string `json:"workspaceId" validate:"required"`
	ContentLength int64  `json:"contentLength" validate:"required,max=10485760"` // 10MB max
	ContentType   string `json:"contentType" validate:"required"`
}

type ExportRequest struct {
	ExportType string `json:"exportType" validate:"required,oneof=markdown html pdf"`
	Content    string `json:"content" validate:"required"`
	FileName   string `json:"fileName" validate:"required"`
}
