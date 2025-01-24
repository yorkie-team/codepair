package database

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Workspace struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title     string        `bson:"title,omitempty" json:"title,omitempty"`
	Slug      string        `bson:"slug,omitempty" json:"slug,omitempty"`
	CreatedAt time.Time     `bson:"created_at,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time     `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
	//
	// DocumentList                 []Document                 `bson:"-" json:"documentList,omitempty"`
	// UserWorkspaceList            []UserWorkspace           `bson:"-" json:"userWorkspaceList,omitempty"`
	// WorkspaceInvitationTokenList []WorkspaceInvitationToken `bson:"-" json:"workspaceInvitationTokenList,omitempty"`
}
