package database

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type IntelligenceLog struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	DocumentID bson.ObjectID `bson:"document_id,omitempty" json:"documentId,omitempty"`
	UserID     bson.ObjectID `bson:"user_id,omitempty" json:"userId,omitempty"`
	MemoryKey  string        `bson:"memory_key,omitempty" json:"memoryKey,omitempty"`
	Question   string        `bson:"question,omitempty" json:"question,omitempty"`
	Answer     string        `bson:"answer,omitempty" json:"answer,omitempty"`
	ExpiredAt  *time.Time    `bson:"expired_at,omitempty" json:"expiredAt,omitempty"`
	CreatedAt  time.Time     `bson:"created_at,omitempty" json:"createdAt,omitempty"`
	UpdatedAt  time.Time     `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}
