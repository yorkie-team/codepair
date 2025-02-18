package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	model "github.com/yorkie-team/codepair/backend/internal/core/hello"
)

type HelloRepository struct {
	conf   *config.Mongo
	client *mongo.Client
}

const ColHello = "hello_messages"

type CodePairVisitor struct {
	ID        bson.ObjectID `bson:"_id"`
	Nickname  string        `bson:"nickname"`
	CreatedAt time.Time     `bson:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at"`
}

func (c *CodePairVisitor) ToDomain() model.CodePairVisitor {
	return model.CodePairVisitor{
		ID:       c.ID.String(),
		Nickname: c.Nickname,
	}
}

// NewHelloRepository creates a new HelloRepository.
func NewHelloRepository(conf *config.Mongo, client *mongo.Client) *HelloRepository {
	return &HelloRepository{conf: conf, client: client}
}

// CreateHelloMessage inserts a new CodePairVisitor message in the database.
func (h *HelloRepository) CreateHelloMessage(ctx context.Context, visitor model.CodePairVisitor) (model.CodePairVisitor, error) {
	visitorRecord := CodePairVisitor{
		ID:        bson.NewObjectID(),
		Nickname:  visitor.Nickname,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if _, err := h.collection(ColHello).InsertOne(ctx, visitorRecord); err != nil {
		return model.CodePairVisitor{}, fmt.Errorf("create hello message: %w", err)
	}

	domainVisitor := visitorRecord.ToDomain()
	return domainVisitor, nil
}

// collection is a helper method to return a reference to a specific collection.
func (h *HelloRepository) collection(name string) *mongo.Collection {
	return h.client.Database(h.conf.DatabaseName).Collection(name)
}
