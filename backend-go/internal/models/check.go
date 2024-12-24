package models

type CheckNameConflictRequest struct {
	Name        string `json:"name"`
	WorkspaceID string `json:"workspaceId"`
}

type CheckNameConflictResponse struct {
	Exists bool `json:"exists"`
}

type CheckYorkieRequest struct {
	DocumentKey string `json:"documentKey"`
}

type CheckYorkieResponse struct {
	Status string `json:"status"`
}
