package database

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Document struct {
	ID               bson.ObjectID `bson:"_id"`
	YorkieDocumentID string        `bson:"yorkie_document_id"`
	Title            string        `bson:"title"`
	Content          *string       `bson:"content"`
	CreatedAt        time.Time     `bson:"created_at"`
	UpdatedAt        time.Time     `bson:"updated_at"`
	WorkspaceID      bson.ObjectID `bson:"workspace_id"`

	DocumentSharingTokenList []DocumentSharingToken `bson:"-" json:"documentSharingTokenList,omitempty"`
	IntelligenceLogList      []IntelligenceLog      `bson:"-" json:"intelligenceLogList,omitempty"`
}
