package mongodb

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// UserWorkspaceRepository implements the operations for user workspace management.
type UserWorkspaceRepository struct {
	userWorkspace *mongo.Collection
	user          *mongo.Collection
}

// NewUserWorkspaceRepository creates a new instance of UserWorkspaceRepository.
func NewUserWorkspaceRepository(client *mongo.Client) *UserWorkspaceRepository {
	conf := config.GetConfig().Mongo
	return &UserWorkspaceRepository{
		userWorkspace: client.Database(conf.DatabaseName).Collection(ColUserWorkspace),
		user:          client.Database(conf.DatabaseName).Collection(ColUsers),
	}
}

func (r *UserWorkspaceRepository) FindUserWorkspaceByUserID(
	ctx context.Context, userID, workspaceID string,
) (entity.UserWorkspace, error) {
	filter := bson.M{"user_id": entity.ID(userID), "workspace_id": entity.ID(workspaceID)}
	result := r.userWorkspace.FindOne(ctx, filter)

	userWorkspace := entity.UserWorkspace{}
	if err := result.Decode(&userWorkspace); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.UserWorkspace{}, database.ErrUserWorkspaceNotFound
		}
		return entity.UserWorkspace{}, fmt.Errorf("find user workspace: %w", err)
	}

	return userWorkspace, nil
}

// NOTE(sigmaith): We need to solve N+1 query problem here.
func (r *UserWorkspaceRepository) FindUserWorkspacesByWorkspaceID(
	ctx context.Context, workspaceID, cursor string, pageSize int,
) ([]entity.User, error) {
	filter := bson.M{"workspace_id": entity.ID(workspaceID)}
	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}}).SetLimit(int64(pageSize))

	if cursor != "" {
		filter["user_id"] = bson.M{"$lt": entity.ID(cursor)}
	}

	cursorResult, err := r.userWorkspace.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("find user workspaces: %w", err)
	}

	defer func(cursorResult *mongo.Cursor, ctx context.Context) {
		err := cursorResult.Close(ctx)
		if err != nil {
			fmt.Printf("error closing cursor: %v\n", err)
		}
	}(cursorResult, ctx)

	var users []entity.User
	for cursorResult.Next(ctx) {
		var userWorkspace entity.UserWorkspace
		if err := cursorResult.Decode(&userWorkspace); err != nil {
			return nil, fmt.Errorf("decode user workspace: %w", err)
		}

		var user entity.User
		if err := r.user.FindOne(ctx, bson.M{"_id": userWorkspace.UserID}).Decode(&user); err != nil {
			return nil, fmt.Errorf("find user by ID: %w", err)
		}

		users = append(users, user)
	}

	if err := cursorResult.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return users, nil
}

func (r *UserWorkspaceRepository) CountUsersByWorkspaceID(ctx context.Context, workspaceID string) (int64, error) {
	filter := bson.M{"workspace_id": entity.ID(workspaceID)}
	count, err := r.userWorkspace.CountDocuments(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("count users in workspace: %w", err)
	}
	return count, nil
}
