package models

type JoinWorkspaceRequest struct {

	// Valid invitation token to join the workspace
	InvitationToken string `json:"invitationToken"`
}
