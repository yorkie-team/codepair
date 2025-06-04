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

// WorkspaceRepository implements the operations for workspaceCollection management.
type WorkspaceRepository struct {
	workspaceCollection           *mongo.Collection
	userWorkspaceCollection       *mongo.Collection
	userCollection                *mongo.Collection
	workspaceInvitationCollection *mongo.Collection
}

// NewWorkspaceRepository creates a new instance of WorkspaceRepository.
func NewWorkspaceRepository(client *mongo.Client) *WorkspaceRepository {
	conf := config.GetConfig().Mongo
	return &WorkspaceRepository{
		workspaceCollection:           client.Database(conf.DatabaseName).Collection(ColWorkspace),
		userWorkspaceCollection:       client.Database(conf.DatabaseName).Collection(ColUserWorkspace),
		userCollection:                client.Database(conf.DatabaseName).Collection(ColUsers),
		workspaceInvitationCollection: client.Database(conf.DatabaseName).Collection(ColWorkspaceInvitation),
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

func (r *WorkspaceRepository) FindWorkspaceBySlug(userID, slug string) (entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"slug": slug, "user_id": userID}
	result := r.workspaceCollection.FindOne(ctx, filter)
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

	filter = bson.M{"_id": workspace.ID, "user_id": userID}
	if err := r.userWorkspaceCollection.FindOne(ctx, filter).Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.Workspace{}, database.ErrWorkspaceNotFound
		}
		return entity.Workspace{}, fmt.Errorf("find user workspace: %w", err)
	}

	return workspace, nil
}

func (r *WorkspaceRepository) FindWorkspacesOfUser(userID, cursor string, pageSize int) ([]entity.Workspace, error) {
	ctx := context.Background()

	filter := bson.M{"user_id": userID}
	opts := options.Find().SetSort(bson.D{{"_id", -1}}).SetLimit(int64(pageSize))

	if cursor != "" {
		filter["_id"] = bson.M{"$lt": entity.ID(cursor)}
	}

	cursorResult, err := r.userWorkspaceCollection.Find(ctx, filter, opts)
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
		if err := r.workspaceCollection.FindOne(ctx, bson.M{"_id": userWorkspace.WorkspaceID}).Decode(&workspace); err != nil {
			return nil, fmt.Errorf("find workspace by ID: %w", err)
		}

		workspaces = append(workspaces, workspace)
	}

	if err := cursorResult.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return workspaces, nil
}

func (r *WorkspaceRepository) CreateInvitationToken(userID, workspaceID string, expiredAt time.Time) (entity.WorkspaceInvitation, error) {
	ctx := context.Background()

	// Check if the workspace exists
	workspace, err := r.FindWorkspaceByID(workspaceID)
	if err != nil {
		return entity.WorkspaceInvitation{}, fmt.Errorf("find workspace by ID: %w", err)
	}

	filter := bson.M{"_id": workspace.ID, "user_id": userID}
	if err := r.userWorkspaceCollection.FindOne(ctx, filter).Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return entity.WorkspaceInvitation{}, database.ErrWorkspaceNotFound
		}
		return entity.WorkspaceInvitation{}, fmt.Errorf("find user workspace: %w", err)
	}

	now := time.Now()
	invitation := entity.WorkspaceInvitation{
		WorkspaceID: workspace.ID,
		Token:       shortuuid.New(), // Assume generateToken is a function that generates a unique token
		ExpiredAt:   expiredAt,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	res, err := r.workspaceInvitationCollection.InsertOne(ctx, invitation)
	if err != nil {
		return entity.WorkspaceInvitation{}, fmt.Errorf("create invitation token: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		invitation.ID = entity.ID(oid.Hex())
	} else {
		return entity.WorkspaceInvitation{}, fmt.Errorf("inserted ID is not of type bson.ObjectID")
	}
	invitation.ID = workspace.ID

	return invitation, nil
}

func (r *WorkspaceRepository) JoinWorkspace(userID, token string) error {
	ctx := context.Background()

	filter := bson.M{"token": token}
	result := r.workspaceInvitationCollection.FindOne(ctx, filter)
	if result.Err() != nil {
		if errors.Is(result.Err(), mongo.ErrNoDocuments) {
			return database.ErrDocumentNotFound
		}
		return fmt.Errorf("find workspace invitation: %w", result.Err())
	}

	var invitation entity.WorkspaceInvitation
	if err := result.Decode(&invitation); err != nil {
		return fmt.Errorf("decode workspace invitation: %w", err)
	}

	// Check if the token is expired
	if time.Now().After(invitation.ExpiredAt) {
		return database.ErrDocumentNotFound
	}

	// Create user workspace
	userWorkspace := entity.UserWorkspace{
		UserID:      entity.ID(userID),
		Role:        entity.RoleMember,
		WorkspaceID: invitation.WorkspaceID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err := r.userWorkspaceCollection.InsertOne(ctx, userWorkspace)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return database.ErrDuplicatedKey
		}
		return fmt.Errorf("create user workspace: %w", err)
	}

	return nil
}
