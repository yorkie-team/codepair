package mongodb

import (
	"context"
	"errors"
	"fmt"
	"github.com/yorkie-team/codepair/backend/internal/config"
	domain "github.com/yorkie-team/codepair/backend/internal/core/user"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

type UserRepository struct {
	conf   *config.Mongo
	client *mongo.Client
}

// NewUserRepository creates instance.
func NewUserRepository(conf *config.Mongo, client *mongo.Client) *UserRepository {
	return &UserRepository{conf: conf, client: client}
}

const ColUsers = "users"

type User struct {
	ID             bson.ObjectID `bson:"_id"`
	SocialProvider string        `bson:"social_provider"`
	SocialUID      string        `bson:"social_uid"`
	Nickname       *string       `bson:"nickname"`
	CreatedAt      time.Time     `bson:"created_at"`
	UpdatedAt      time.Time     `bson:"updated_at"`
}

func (u *User) ToDomain() *domain.User {
	return &domain.User{
		ID:             u.ID.String(),
		SocialProvider: u.SocialProvider,
		SocialUID:      u.SocialUID,
		Nickname:       u.Nickname,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}
}

// FindUserByID returns a user by its ID, or nil if not found.
func (r *UserRepository) FindUserByID(ctx context.Context, userID string) (*domain.User, error) {
	result := r.collection(ColUsers).FindOne(ctx, bson.M{"_id": userID})

	user := User{}
	if err := result.Decode(&user); err != nil {
		return nil, fmt.Errorf("find user by ID: %w", err)
	}

	return user.ToDomain(), nil
}

// FindUserBySocialUID checks if user exists with given provider & uid.
func (r *UserRepository) FindUserBySocialUID(
	ctx context.Context,
	provider,
	uid string,
	createIfNotExist bool,
) (*domain.User, error) {
	filter := bson.M{"social_provider": provider, "social_uid": uid}

	result := r.collection(ColUsers).FindOne(ctx, filter)
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) && createIfNotExist {
			return r.createUser(ctx, provider, uid)
		}
		return nil, fmt.Errorf("find user by social UID: %w", err)
	}

	user := User{}
	if err := result.Decode(&user); err != nil {
		return nil, fmt.Errorf("decode user: %w", err)
	}

	return user.ToDomain(), nil
}

// collection is a helper method to return a reference to a specific collection.
func (r *UserRepository) collection(name string) *mongo.Collection {
	return r.client.Database(r.conf.DatabaseName).Collection(name)
}

// createUser creates a new user with the given provider and uid.
func (r *UserRepository) createUser(ctx context.Context, provider, uid string) (*domain.User, error) {
	user := User{
		ID:             bson.NewObjectID(),
		SocialProvider: provider,
		SocialUID:      uid,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if _, err := r.collection(ColUsers).InsertOne(ctx, user); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return user.ToDomain(), nil
}
