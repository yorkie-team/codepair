package database

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type WorkspaceInvitationToken struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Token       string        `bson:"token,omitempty" json:"token,omitempty"`
	WorkspaceID bson.ObjectID `bson:"workspace_id,omitempty" json:"workspaceId,omitempty"`
	ExpiredAt   *time.Time    `bson:"expired_at,omitempty" json:"expiredAt,omitempty"`
	CreatedAt   time.Time     `bson:"created_at,omitempty" json:"createdAt,omitempty"`
	UpdatedAt   time.Time     `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}

type DocumentSharingToken struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Token      string        `bson:"token,omitempty" json:"token,omitempty"`
	Role       string        `bson:"role,omitempty" json:"role,omitempty"`
	DocumentID bson.ObjectID `bson:"document_id,omitempty" json:"documentId,omitempty"`
	ExpiredAt  *time.Time    `bson:"expired_at,omitempty" json:"expiredAt,omitempty"`
	CreatedAt  time.Time     `bson:"created_at,omitempty" json:"createdAt,omitempty"`
	UpdatedAt  time.Time     `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}
