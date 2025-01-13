package dto

type CreateWorkspaceRequest struct {
	Title string `json:"title"`
}

type UpdateWorkspaceRequest struct {
	Title string `json:"title"`
}

type CreateInvitationTokenRequest struct {
	WorkspaceID string `json:"workspaceId"`
}
