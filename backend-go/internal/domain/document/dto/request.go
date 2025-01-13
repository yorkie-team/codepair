package dto

type CreateDocumentRequest struct {
	WorkspaceID string `json:"workspaceId"`
	Title       string `json:"title"`
}

type UpdateDocumentTitleRequest struct {
	Title string `json:"title"`
}

type CreateShareTokenRequest struct {
	DocumentID string `json:"documentId"`
}
