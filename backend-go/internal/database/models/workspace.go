package models

import "time"

type Workspace struct {
	ID        string    `json:"id" bson:"_id"`
	Title     string    `json:"title" bson:"title"`
	Slug      string    `json:"slug" bson:"slug"`
	OwnerID   string    `json:"ownerId" bson:"ownerId"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}
