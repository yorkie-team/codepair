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

// UserRepository implements the CRUD operations for the hello service.
type UserRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new instance of NewUserRepository.
func NewUserRepository(conf *config.Mongo, client *mongo.Client) *UserRepository {
	return &UserRepository{
		collection: client.Database(conf.DatabaseName).Collection(ColUsers),
	}
}

func (r *UserRepository) FindUser(id entity.ID) (entity.User, error) {
	user := entity.User{}
	filter := bson.M{"_id": id}

	err := r.collection.FindOne(context.Background(), filter).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.User{}, database.ErrDocumentNotFound
	} else if err != nil {
		return entity.User{}, fmt.Errorf("find visitor: %w", err)
	}

	return user, nil
}

func (r *UserRepository) UpdateNickname(id entity.ID, nickname string) error {
	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"nickname":   nickname,
			"updated_at": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("update user nickname: %w", err)
	}
	if result.MatchedCount == 0 {
		return database.ErrDocumentNotFound
	}
	return nil
}
