package mongodb

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"time"

	"github.com/lithammer/shortuuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// WorkspaceRepository implements the operations for workspace management.
type WorkspaceRepository struct {
	workspace           *mongo.Collection
	userWorkspace       *mongo.Collection
	user                *mongo.Collection
	workspaceInvitation *mongo.Collection
}

// NewWorkspaceRepository creates a new instance of WorkspaceRepository.
func NewWorkspaceRepository(client *mongo.Client) *WorkspaceRepository {
	conf := config.GetConfig().Mongo
	return &WorkspaceRepository{
		workspace:           client.Database(conf.DatabaseName).Collection(ColWorkspace),
		userWorkspace:       client.Database(conf.DatabaseName).Collection(ColUserWorkspace),
		user:                client.Database(conf.DatabaseName).Collection(ColUsers),
		workspaceInvitation: client.Database(conf.DatabaseName).Collection(ColWorkspaceInvitation),
	}
}

// FindWorkspaceByID retrieves a workspace by its ID.
func (r *WorkspaceRepository) FindWorkspaceByID(id string) (entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"_id": id}
	result := r.workspace.FindOne(ctx, filter)

	workspace := entity.Workspace{}
	if err := result.Decode(&workspace); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.Workspace{}, database.ErrWorkspaceNotFound
		}
		return entity.Workspace{}, fmt.Errorf("find workspace: %w", err)
	}

	return workspace, nil
}

func (r *WorkspaceRepository) CreateWorkspace(userID, title string) (entity.Workspace, error) {
	ctx := context.Background()

	// 01. Check workspace nickname conflict policy
	if err := r.CheckConflict(ctx, title); err != nil {
		return entity.Workspace{}, fmt.Errorf("check conflict: %w", err)
	}

	// 02. Create workspace and user_workspace
	now := time.Now()
	workspace := entity.Workspace{
		Title:     title,
		Slug:      url.PathEscape(title),
		CreatedAt: now,
		UpdatedAt: now,
	}

	doc := bson.M{
		"title":      workspace.Title,
		"slug":       workspace.Slug,
		"created_at": workspace.CreatedAt,
		"updated_at": workspace.UpdatedAt,
	}

	res, err := r.workspace.InsertOne(ctx, doc)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return entity.Workspace{}, database.ErrDuplicatedKey
		}
		return entity.Workspace{}, fmt.Errorf("create workspace: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		workspace.ID = entity.ID(oid.Hex())
	}

	userWorkspace := bson.M{
		"user_id":      entity.ID(userID),
		"role":         entity.RoleOwner,
		"workspace_id": workspace.ID,
		"created_at":   now,
		"updated_at":   now,
	}

	_, err = r.userWorkspace.InsertOne(ctx, userWorkspace)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return entity.Workspace{}, database.ErrDuplicatedKey
		}
		return entity.Workspace{}, fmt.Errorf("create user workspace: %w", err)
	}

	return workspace, nil
}

func (r *WorkspaceRepository) FindWorkspaceBySlug(userID, slug string) (entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"slug": slug}
	result := r.workspace.FindOne(ctx, filter)
	if result.Err() != nil {
		if errors.Is(result.Err(), mongo.ErrNoDocuments) {
			return entity.Workspace{}, database.ErrWorkspaceNotFound
		}
		return entity.Workspace{}, fmt.Errorf("find workspace by slug: %w", result.Err())
	}

	workspace := entity.Workspace{}
	if err := result.Decode(&workspace); err != nil {
		return entity.Workspace{}, fmt.Errorf("decode workspace: %w", err)
	}

	filter = bson.M{"workspace_id": workspace.ID, "user_id": entity.ID(userID)}
	if err := r.userWorkspace.FindOne(ctx, filter).Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.Workspace{}, database.ErrUserWorkspaceNotFound
		}
		return entity.Workspace{}, fmt.Errorf("find user workspace: %w", err)
	}

	return workspace, nil
}

func (r *WorkspaceRepository) FindWorkspacesOfUser(userID, cursor string, pageSize int) ([]entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"user_id": entity.ID(userID)}
	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}}).SetLimit(int64(pageSize))

	if cursor != "" {
		filter["_id"] = bson.M{"$lt": entity.ID(cursor)}
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

	// NOTE(window9u): We need to solve N+1 query problem here.
	var workspaces []entity.Workspace
	for cursorResult.Next(ctx) {
		var userWorkspace entity.UserWorkspace
		if err := cursorResult.Decode(&userWorkspace); err != nil {
			return nil, fmt.Errorf("decode user workspace: %w", err)
		}

		var workspace entity.Workspace
		if err := r.workspace.FindOne(ctx, bson.M{"_id": userWorkspace.WorkspaceID}).Decode(&workspace); err != nil {
			return nil, fmt.Errorf("find workspace by ID: %w", err)
		}

		workspaces = append(workspaces, workspace)
	}

	if err := cursorResult.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return workspaces, nil
}

func (r *WorkspaceRepository) CreateInvitationToken(
	userID, workspaceID string, expiredAt time.Time,
) (entity.WorkspaceInvitation, error) {
	ctx := context.Background()

	uw := entity.UserWorkspace{}
	filter := bson.M{"workspace_id": workspaceID, "user_id": userID, "role": entity.RoleOwner}
	if err := r.userWorkspace.FindOne(ctx, filter).Decode(&uw); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.WorkspaceInvitation{}, database.ErrWorkspaceNotFound
		}
		return entity.WorkspaceInvitation{}, fmt.Errorf("find user workspace: %w", err)
	}

	now := time.Now()
	invitation := entity.WorkspaceInvitation{
		WorkspaceID: uw.WorkspaceID,
		Token:       shortuuid.New(),
		ExpiredAt:   expiredAt,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	res, err := r.workspaceInvitation.InsertOne(ctx, invitation)
	if err != nil {
		return entity.WorkspaceInvitation{}, fmt.Errorf("create invitation token: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); !ok {
		return entity.WorkspaceInvitation{}, fmt.Errorf("inserted ID is not ObjectID: %v", res.InsertedID)
	} else {
		invitation.ID = entity.ID(oid.Hex())
	}

	return invitation, nil
}

func (r *WorkspaceRepository) JoinWorkspace(userID, token string) error {
	ctx := context.Background()

	filter := bson.M{"token": token}
	var invitation entity.WorkspaceInvitation

	if err := r.workspaceInvitation.FindOne(ctx, filter).Decode(&invitation); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return database.ErrWorkspaceInvitationNotFound
		}
		return fmt.Errorf("find workspace invitation: %w", err)
	}

	if time.Now().After(invitation.ExpiredAt) {
		return database.ErrWorkspaceInvitationExpired
	}

	userWorkspace := entity.UserWorkspace{
		UserID:      entity.ID(userID),
		WorkspaceID: invitation.WorkspaceID,
		Role:        entity.RoleMember,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err := r.userWorkspace.InsertOne(ctx, userWorkspace)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return database.ErrDuplicatedKey
		}
		return fmt.Errorf("create user workspace: %w", err)
	}

	return nil
}

func (r *WorkspaceRepository) CheckConflict(ctx context.Context, title string) error {
	err := r.workspace.FindOne(ctx, bson.M{"title": title}).Err()
	if err == nil {
		return database.ErrWorkspaceNameConflict
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return fmt.Errorf("find workspace by title: %w", err)
	}

	err = r.user.FindOne(ctx, bson.M{"nickname": title}).Err()
	if err == nil {
		return database.ErrWorkspaceNameConflict
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return fmt.Errorf("find user by nickname: %w", err)
	}

	return nil
}
