package models

type ExportFileResponse struct {

	// Binary content of the exported file
	FileContent map[string]interface{} `json:"fileContent"`

	// MIME type of the exported file
	MimeType string `json:"mimeType"`

	// Name of the exported file (with extension)
	FileName string `json:"fileName"`
}
