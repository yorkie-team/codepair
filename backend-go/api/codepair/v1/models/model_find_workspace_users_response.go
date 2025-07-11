package models

type FindWorkspaceUsersResponse struct {

	// List of workspace users
	WorkspaceUsers []WorkspaceUserDomain `json:"workspaceUsers"`

	// The ID of the last workspace user (for pagination)
	Cursor string `json:"cursor"`

	// Total count of workspace users
	TotalLength int64 `json:"totalLength"`
}
