package models

import (
	"time"
)

type Workspace struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Title     string    `json:"title" bson:"title"`
	CreatorID string    `json:"creatorId" bson:"creatorId"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

type CreateWorkspaceRequest struct {
	Title string `json:"title"`
}

type WorkspaceResponse struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	CreatorID string    `json:"creatorId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type FindWorkspacesResponse struct {
	Cursor      *string             `json:"cursor"`
	TotalLength int64               `json:"totalLength"`
	Workspaces  []WorkspaceResponse `json:"workspaces"`
}

type CreateInvitationTokenRequest struct {
	ExpiredAt *time.Time `json:"expiredAt"`
}

type CreateInvitationTokenResponse struct {
	InvitationToken string `json:"invitationToken"`
}
