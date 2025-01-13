package models

import "time"

type Document struct {
	ID          string    `json:"id" bson:"_id"`
	Title       string    `json:"title" bson:"title"`
	WorkspaceID string    `json:"workspaceId" bson:"workspaceId"`
	CreatorID   string    `json:"creatorId" bson:"creatorId"`
	Content     string    `json:"content" bson:"content"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}
