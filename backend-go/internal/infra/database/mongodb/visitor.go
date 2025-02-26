package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// HelloRepository implements the CRUD operations for the hello service.
type HelloRepository struct {
	collection *mongo.Collection
}

// NewHelloRepo creates a new instance of HelloRepository.
func NewHelloRepo(conf *config.Mongo, client *mongo.Client) *HelloRepository {
	return &HelloRepository{
		collection: client.Database(conf.DatabaseName).Collection(ColVisitor),
	}
}

// CreateVisitor inserts a new visitor record into the database,
// letting MongoDB auto-generate the _id field.
func (r *HelloRepository) CreateVisitor(visitor entity.Visitor) (entity.Visitor, error) {
	now := time.Now()
	visitor.CreatedAt = now
	visitor.UpdatedAt = now

	res, err := r.collection.InsertOne(context.Background(), visitor)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return entity.Visitor{}, database.ErrDuplicatedKey
		}
		return entity.Visitor{}, fmt.Errorf("create visitor: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		visitor.ID = entity.ID(oid.String())
	}

	return visitor, nil
}

// FindVisitor retrieves a visitor record by its id.
func (r *HelloRepository) FindVisitor(id entity.ID) (entity.Visitor, error) {
	visitor := entity.Visitor{}
	filter := bson.M{"_id": id}

	err := r.collection.FindOne(context.Background(), filter).Decode(&visitor)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Visitor{}, database.ErrDocumentNotFound
	} else if err != nil {
		return entity.Visitor{}, fmt.Errorf("find visitor: %w", err)
	}

	return visitor, nil
}

// UpdateVisitor updates an existing visitor record.
func (r *HelloRepository) UpdateVisitor(visitor entity.Visitor) error {
	visitor.UpdatedAt = time.Now()
	filter := bson.M{"_id": visitor.ID}
	update := bson.M{
		"$set": bson.M{
			"nickname":   visitor.Nickname,
			"updated_at": visitor.UpdatedAt,
		},
	}

	result, err := r.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("update visitor: %w", err)
	}
	if result.MatchedCount == 0 {
		return database.ErrDocumentNotFound
	}
	return nil
}

// DeleteVisitor removes a visitor record by its id.
func (r *HelloRepository) DeleteVisitor(id entity.ID) error {
	filter := bson.M{"_id": id}
	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("delete visitor: %w", err)
	}
	if result.DeletedCount == 0 {
		return database.ErrDocumentNotFound
	}
	return nil
}
