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

// CreateUserBySocial creates user by Social id and provider.
func (r *UserRepository) CreateUserBySocial(provider, uid string) (entity.ID, error) {
	ctx := context.Background()

	now := time.Now()
	result, err := r.collection.InsertOne(ctx, bson.M{
		"social_provider": provider,
		"social_uid":      uid,
		"nickname":        "",
		"created_at":      now,
		"updated_at":      now,
	})
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return "", database.ErrUserAlreadyExists
		}

		return "", fmt.Errorf("create user: %w", err)
	}

	oid, ok := result.InsertedID.(bson.ObjectID)
	if !ok {
		return "", fmt.Errorf("unexpected ID type: %T", result.InsertedID)
	}

	return entity.ID(oid.Hex()), nil
}

// FindUser retrieves a user by their ID.
func (r *UserRepository) FindUser(id entity.ID) (entity.User, error) {
	ctx := context.Background()

	user := entity.User{}
	filter := bson.M{"_id": id}

	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.User{}, database.ErrUserNotFound
	} else if err != nil {
		return entity.User{}, fmt.Errorf("find user: %w", err)
	}

	return user, nil
}

// UpdateNickname updates the nickname of a user.
func (r *UserRepository) UpdateNickname(id entity.ID, nickname string) error {
	ctx := context.Background()

	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"nickname":   nickname,
			"updated_at": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return database.ErrNicknameConflict
		}
		return fmt.Errorf("update user nickname: %w", err)
	}

	if result.MatchedCount == 0 {
		return database.ErrUserNotFound
	}
	return nil
}
