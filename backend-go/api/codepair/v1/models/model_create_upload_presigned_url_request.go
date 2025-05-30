package models

type CreateUploadPresignedUrlRequest struct {

	// Workspace ID where the file will be stored
	WorkspaceId string `json:"workspaceId"`

	// Size of the content to upload
	ContentLength int64 `json:"contentLength"`

	// MIME type of the file to be uploaded
	ContentType string `json:"contentType"`
}
