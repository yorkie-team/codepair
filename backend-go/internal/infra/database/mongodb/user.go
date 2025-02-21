package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/core/user"
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

func (u *User) ToDomain() *user.User {
	return &user.User{
		ID:             u.ID.String(),
		SocialProvider: u.SocialProvider,
		SocialUID:      u.SocialUID,
		Nickname:       u.Nickname,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}
}

// FindUserByID returns a user by its ID, or nil if not found.
func (r *UserRepository) FindUserByID(ctx context.Context, userID string) (*user.User, error) {
	result := r.collection(ColUsers).FindOne(ctx, bson.M{"_id": userID})

	u := User{}
	if err := result.Decode(&u); err != nil {
		return nil, fmt.Errorf("find u by ID: %w", err)
	}

	return u.ToDomain(), nil
}

// FindUserBySocialUID checks if user exists with given provider & uid.
func (r *UserRepository) FindUserBySocialUID(
	ctx context.Context,
	provider,
	uid string,
) (*user.User, error) {
	filter := bson.M{"social_provider": provider, "social_uid": uid}

	result := r.collection(ColUsers).FindOne(ctx, filter)
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, user.ErrUserNotFound
		}
		return nil, fmt.Errorf("find u by social UID: %w", err)
	}

	u := User{}
	if err := result.Decode(&u); err != nil {
		return nil, fmt.Errorf("decode u: %w", err)
	}

	return u.ToDomain(), nil
}

func (r *UserRepository) CreateUserWithSocial(
	ctx context.Context,
	provider, socialID string,
) (*user.User, error) {
	u := User{
		SocialProvider: provider,
		SocialUID:      socialID,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if _, err := r.collection(ColUsers).InsertOne(ctx, u); err != nil {
		return nil, fmt.Errorf("create u: %w", err)
	}

	return u.ToDomain(), nil
}

// collection is a helper method to return a reference to a specific collection.
func (r *UserRepository) collection(name string) *mongo.Collection {
	return r.client.Database(r.conf.DatabaseName).Collection(name)
}
