package models

type StorageProvider string

const (
	StorageProviderS3    StorageProvider = "s3"
	StorageProviderMinio StorageProvider = "minio"
)

type UploadRequest struct {
	WorkspaceID   string `json:"workspaceId" validate:"required"`
	ContentLength int64  `json:"contentLength" validate:"required,max=10485760"` // 10MB max
	ContentType   string `json:"contentType" validate:"required"`
}

type UploadResponse struct {
	FileKey string `json:"fileKey"`
	URL     string `json:"url"`
}

type DownloadResponse struct {
	URL string `json:"url"`
}

type ExportRequest struct {
	ExportType string `json:"exportType" validate:"required,oneof=markdown html pdf"`
	Content    string `json:"content" validate:"required"`
	FileName   string `json:"fileName" validate:"required"`
}

type ExportResponse struct {
	FileContent []byte `json:"fileContent"`
	MimeType    string `json:"mimeType"`
	FileName    string `json:"fileName"`
}
