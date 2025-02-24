package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

// ColVisitor is the name of the collection storing visitor records.
const ColVisitor = "hello_visitors"

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
func (r *HelloRepository) CreateVisitor(visitor database.Visitor) (database.Visitor, error) {
	now := time.Now()
	visitor.CreatedAt = now
	visitor.UpdatedAt = now

	res, err := r.collection.InsertOne(context.Background(), visitor)
	if err != nil {
		return database.Visitor{}, fmt.Errorf("failed to create visitor: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		visitor.ID = database.ID(oid.String())
	}

	return visitor, nil
}

// FindVisitor retrieves a visitor record by its id.
func (r *HelloRepository) FindVisitor(id database.ID) (database.Visitor, error) {
	var visitor database.Visitor
	filter := bson.M{"_id": id}
	if err := r.collection.FindOne(context.Background(), filter).Decode(&visitor); err != nil {
		return database.Visitor{}, fmt.Errorf("failed to find visitor: %w", err)
	}

	return visitor, nil
}

// UpdateVisitor updates an existing visitor record.
func (r *HelloRepository) UpdateVisitor(visitor database.Visitor) error {
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
		return fmt.Errorf("failed to update visitor: %w", err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("no visitor found with id %s", visitor.ID)
	}
	return nil
}

// DeleteVisitor removes a visitor record by its id.
func (r *HelloRepository) DeleteVisitor(id database.ID) error {
	filter := bson.M{"_id": id}
	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("failed to delete visitor: %w", err)
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("no visitor found with id %s", id)
	}
	return nil
}
