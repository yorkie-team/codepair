package models

type ExportFileRequest struct {

	// Target format for export (e.g., PDF, HTML)
	ExportType string `json:"exportType"`

	// Markdown content to be exported
	Content string `json:"content"`

	// Desired filename (without extension)
	FileName string `json:"fileName"`
}
