package models

type FindSettingsResponse struct {

	// Settings related to Yorkie Intelligence
	YorkieIntelligence YorkieIntelligenceConfig `json:"yorkieIntelligence"`

	// Settings related to file uploads
	FileUpload FileUploadConfig `json:"fileUpload"`
}
