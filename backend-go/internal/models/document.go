package models

import (
	"time"
)

type Document struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Title       string    `json:"title" bson:"title"`
	WorkspaceID string    `json:"workspaceId" bson:"workspaceId"`
	CreatorID   string    `json:"creatorId" bson:"creatorId"`
	Content     string    `json:"content" bson:"content"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}

type CreateDocumentRequest struct {
	Title       string `json:"title"`
	WorkspaceID string `json:"workspaceId"`
}

type UpdateDocumentTitleRequest struct {
	Title string `json:"title"`
}

type CreateDocumentShareTokenRequest struct {
	ExpiredAt *time.Time `json:"expiredAt"`
}

type CreateDocumentShareTokenResponse struct {
	SharingToken string `json:"sharingToken"`
}

type FindDocumentFromSharingTokenResponse struct {
	Document Document `json:"document"`
}
