package models

type CreateUploadPresignedUrlResponse struct {

	// Presigned URL for uploading the file
	Url string `json:"url"`

	// Storage key of the uploaded file
	FileKey string `json:"fileKey"`
}
