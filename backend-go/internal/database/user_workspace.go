package database

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type UserWorkspace struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      bson.ObjectID `bson:"user_id,omitempty" json:"userId,omitempty"`
	Role        string        `bson:"role,omitempty" json:"role,omitempty"`
	WorkspaceID bson.ObjectID `bson:"workspace_id,omitempty" json:"workspaceId,omitempty"`
	CreatedAt   time.Time     `bson:"created_at,omitempty" json:"createdAt,omitempty"`
	UpdatedAt   time.Time     `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
	//
	// If you want to embed the related user/workspace structures,
	// you can add (but these won't be stored automatically; you'd
	// populate them yourself after fetching):
	//
	// User      *User      `bson:"-" json:"user,omitempty"`
	// Workspace *Workspace `bson:"-" json:"workspace,omitempty"`
}
