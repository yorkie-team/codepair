package entity

import "time"

type WorkspaceInvitation struct {
	ID          ID        `bson:"_id"`
	WorkspaceID ID        `bson:"workspace_id"`
	Token       string    `bson:"token"`
	ExpiredAt   time.Time `bson:"expired_at"`
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`
}
