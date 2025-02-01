package models

type FindWorkspaceDocumentsResponse struct {

	// List of retrieved workspace documents
	Documents []WorkspaceDocumentDomain `json:"documents"`

	// The ID of the last document (for pagination)
	Cursor string `json:"cursor"`

	// Total count of documents in the workspace
	TotalLength float32 `json:"totalLength"`
}
