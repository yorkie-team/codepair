package mongodb

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// WorkspaceRepository implements the operations for workspace management.
type WorkspaceRepository struct {
    collection *mongo.Collection
}

// NewWorkspaceRepository creates a new instance of WorkspaceRepository.
func NewWorkspaceRepository(conf *config.Mongo, client *mongo.Client) *WorkspaceRepository {
    return &WorkspaceRepository{
        collection: client.Database(conf.DatabaseName).Collection("workspaces"),
    }
}

// FindWorkspaceByID retrieves a workspace by its ID.
func (r *WorkspaceRepository) FindWorkspaceByID(id entity.ID) (entity.Workspace, error) {
    ctx := context.Background()

    filter := bson.M{"_id": id}
    result := r.collection.FindOne(ctx, filter)

    workspace := entity.Workspace{}
    if err := result.Decode(&workspace); err != nil {
        if errors.Is(err, mongo.ErrNoDocuments) {
            return entity.Workspace{}, database.ErrWorkspaceNotFound
        }
        return entity.Workspace{}, fmt.Errorf("find workspace: %w", err)
    }

    return workspace, nil
}
