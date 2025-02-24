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
func (r *HelloRepository) CreateVisitor(visitor database.Visitor) error {
	now := time.Now()
	visitor.CreatedAt = now
	visitor.UpdatedAt = now
	// Ensure ID is empty so that MongoDB will auto-generate it.
	visitor.ID = ""

	result, err := r.collection.InsertOne(context.Background(), visitor)
	if err != nil {
		return fmt.Errorf("failed to create visitor: %w", err)
	}

	// Optionally, update the visitor with the generated id.
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		visitor.ID = oid.Hex()
	}
	return nil
}

// FindVisitor retrieves a visitor record by its id.
func (r *HelloRepository) FindVisitor(id string) (database.Visitor, error) {
	// Convert string id to ObjectID.
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return database.Visitor{}, fmt.Errorf("invalid id format: %w", err)
	}

	// Use an intermediate type to correctly decode the auto-generated ObjectID.
	var resultModel struct {
		ID        bson.ObjectID `bson:"_id"`
		Nickname  string        `bson:"nickname"`
		CreatedAt time.Time     `bson:"created_at"`
		UpdatedAt time.Time     `bson:"updated_at"`
	}

	filter := bson.M{"_id": oid}
	err = r.collection.FindOne(context.Background(), filter).Decode(&resultModel)
	if err != nil {
		return database.Visitor{}, fmt.Errorf("failed to find visitor: %w", err)
	}

	return database.Visitor{
		ID:        resultModel.ID.Hex(),
		Nickname:  resultModel.Nickname,
		CreatedAt: resultModel.CreatedAt,
		UpdatedAt: resultModel.UpdatedAt,
	}, nil
}

// UpdateVisitor updates an existing visitor record.
func (r *HelloRepository) UpdateVisitor(visitor database.Visitor) error {
	oid, err := bson.ObjectIDFromHex(visitor.ID)
	if err != nil {
		return fmt.Errorf("invalid id format: %w", err)
	}

	visitor.UpdatedAt = time.Now()
	filter := bson.M{"_id": oid}
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
func (r *HelloRepository) DeleteVisitor(id string) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid id format: %w", err)
	}

	filter := bson.M{"_id": oid}
	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("failed to delete visitor: %w", err)
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("no visitor found with id %s", id)
	}
	return nil
}
