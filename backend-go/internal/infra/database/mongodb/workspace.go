package mongodb

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// WorkspaceRepository implements the operations for workspaceCollection management.
type WorkspaceRepository struct {
	workspaceCollection     *mongo.Collection
	userWorkspaceCollection *mongo.Collection
	userCollection          *mongo.Collection
}

// NewWorkspaceRepository creates a new instance of WorkspaceRepository.
func NewWorkspaceRepository(client *mongo.Client) *WorkspaceRepository {
	conf := config.GetConfig().Mongo
	return &WorkspaceRepository{
		workspaceCollection:     client.Database(conf.DatabaseName).Collection("workspaces"),
		userWorkspaceCollection: client.Database(conf.DatabaseName).Collection("user_workspaces"),
		userCollection:          client.Database(conf.DatabaseName).Collection("users"),
	}
}

// FindWorkspaceByID retrieves a workspaceCollection by its ID.
func (r *WorkspaceRepository) FindWorkspaceByID(id string) (entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"_id": id}
	result := r.workspaceCollection.FindOne(ctx, filter)

	workspace := entity.Workspace{}
	if err := result.Decode(&workspace); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.Workspace{}, database.ErrWorkspaceNotFound
		}
		return entity.Workspace{}, fmt.Errorf("find workspaceCollection: %w", err)
	}

	return workspace, nil
}

func (r *WorkspaceRepository) CreateWorkspace(userID, title string) (entity.Workspace, error) {
	ctx := context.Background()

	// 01. Check workspace nickname conflict policy
	err := r.workspaceCollection.FindOne(ctx, bson.M{"title": title, "user_id": userID}).Err()
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Workspace{}, database.ErrWorkspaceNameConflict
	}

	err = r.userCollection.FindOne(ctx, bson.M{"nickname": title}).Err()
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Workspace{}, database.ErrWorkspaceNameConflict
	}

	// 02. Create workspace and user_workspace
	workspace := entity.Workspace{
		Title:     title,
		Slug:      url.PathEscape(title),
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
	}

	res, err := r.workspaceCollection.InsertOne(ctx, workspace)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return entity.Workspace{}, database.ErrDuplicatedKey
		}
		return entity.Workspace{}, fmt.Errorf("create workspaceCollection: %w", err)
	}

	userWorkspace := entity.UserWorkspace{
		UserID:      entity.ID(userID),
		Role:        entity.RoleOwner,
		WorkspaceID: entity.ID(res.InsertedID.(bson.ObjectID).Hex()),
		CreatedAt:   time.Time{},
		UpdatedAt:   time.Time{},
	}

	_, err = r.userWorkspaceCollection.InsertOne(ctx, userWorkspace)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return entity.Workspace{}, database.ErrDuplicatedKey
		}
		return entity.Workspace{}, fmt.Errorf("create user workspaceCollection: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		workspace.ID = entity.ID(oid.Hex())
	}

	return workspace, nil
}

func (r *WorkspaceRepository) FindWorkspacesOfUser(userID, cursor string, pageSize int) ([]entity.Workspace, error) {
	return nil, fmt.Errorf("not implemented yet") // TODO: Implement this method
}
func (r *WorkspaceRepository) FindWorkspaceBySlug(userID, slug string) (entity.Workspace, error) {
	return entity.Workspace{}, fmt.Errorf("not implemented yet") // TODO: Implement this method
}

func (r *WorkspaceRepository) CreateInvitationToken(userID, workspaceID string, expiredAt time.Time) (entity.WorkspaceInvitation, error) {
	return entity.WorkspaceInvitation{}, fmt.Errorf("not implemented yet") // TODO: Implement this method
}

func (r *WorkspaceRepository) JoinWorkspace(userID, token string) (entity.UserWorkspace, error) {
	return entity.UserWorkspace{}, fmt.Errorf("not implemented yet") // TODO: Implement this method
}
