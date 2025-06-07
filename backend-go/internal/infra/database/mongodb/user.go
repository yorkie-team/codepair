package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/lithammer/shortuuid"
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
func NewUserRepository(client *mongo.Client) *UserRepository {
	conf := config.GetConfig().Mongo
	return &UserRepository{
		collection: client.Database(conf.DatabaseName).Collection(ColUsers),
	}
}

// FindOrCreateUserBySocialID creates user by Social id and provider.
func (r *UserRepository) FindOrCreateUserBySocialID(ctx context.Context, provider, uid string) (entity.ID, error) {
	now := time.Now()

	doc := bson.M{
		"social_provider": provider,
		"social_uid":      uid,
		// Note(window9u): nickname is not unique, so we should use a random string
		"nickname":   fmt.Sprintf("user-%s", shortuuid.New()),
		"created_at": now,
		"updated_at": now,
	}
	result, err := r.collection.InsertOne(ctx, doc)
	if err == nil {
		oid, ok := result.InsertedID.(bson.ObjectID)
		if !ok {
			return "", fmt.Errorf("inserted ID is not of type bson.ObjectID but %T", result.InsertedID)
		}
		return entity.ID(oid.Hex()), nil
	}

	if !mongo.IsDuplicateKeyError(err) {
		return "", fmt.Errorf("insert user: %w", err)
	}

	filter := bson.M{
		"social_provider": provider,
		"social_uid":      uid,
	}

	user := entity.User{}
	if err := r.collection.FindOne(ctx, filter).Decode(&user); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return "", database.ErrUserNotFound
		}
		return "", fmt.Errorf("find user: %w", err)
	}

	return user.ID, nil
}

// FindUser retrieves a user by their ID.
func (r *UserRepository) FindUser(ctx context.Context, id entity.ID) (entity.User, error) {
	filter := bson.M{"_id": id}
	result := r.collection.FindOne(ctx, filter)

	user := entity.User{}
	if err := result.Decode(&user); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.User{}, database.ErrUserNotFound
		}
		return entity.User{}, fmt.Errorf("find user: %w", err)
	}

	return user, nil
}

// UpdateNickname updates the nickname of a user.
func (r *UserRepository) UpdateNickname(ctx context.Context, id entity.ID, nickname string) error {
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
