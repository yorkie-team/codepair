package models

type FindWorkspacesResponse struct {

	// List of retrieved workspaces
	Workspaces []WorkspaceDomain `json:"workspaces"`

	// The ID of the last workspace (for pagination)
	Cursor string `json:"cursor"`
}
