package dto

type CreateUploadPresignedUrlResponse struct {
	URL     string `json:"url"`
	FileKey string `json:"fileKey"`
}

type ExportFileResponse struct {
	FileContent []byte `json:"fileContent"`
	MimeType    string `json:"mimeType"`
	FileName    string `json:"fileName"`
}

type UploadResponse struct {
	FileKey string `json:"fileKey"`
	URL     string `json:"url"`
}

type DownloadResponse struct {
	URL string `json:"url"`
}

type ExportResponse struct {
	FileContent []byte `json:"fileContent"`
	MimeType    string `json:"mimeType"`
	FileName    string `json:"fileName"`
}
