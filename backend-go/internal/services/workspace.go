package services

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
)

type WorkspaceService struct {
	db     *mongo.Database
	config *config.Config
}

func NewWorkspaceService(db *mongo.Database, cfg *config.Config) *WorkspaceService {
	return &WorkspaceService{
		db:     db,
		config: cfg,
	}
}

func (s *WorkspaceService) Create(userID string, title string) (*models.WorkspaceResponse, error) {
	workspace := &models.Workspace{
		Title:     title,
		CreatorID: userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	collection := s.db.Collection("workspaces")
	result, err := collection.InsertOne(context.Background(), workspace)
	if err != nil {
		return nil, err
	}

	workspace.ID = result.InsertedID.(primitive.ObjectID).Hex()

	// Create user workspace relationship
	userWorkspace := bson.M{
		"userId":      userID,
		"workspaceId": workspace.ID,
		"role":        "owner",
		"createdAt":   time.Now(),
		"updatedAt":   time.Now(),
	}

	_, err = s.db.Collection("userWorkspaces").InsertOne(context.Background(), userWorkspace)
	if err != nil {
		return nil, err
	}

	return &models.WorkspaceResponse{
		ID:        workspace.ID,
		Title:     workspace.Title,
		CreatorID: workspace.CreatorID,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}, nil
}

func (s *WorkspaceService) FindMany(userID string, pageSize int, cursor string) (*models.FindWorkspacesResponse, error) {
	collection := s.db.Collection("workspaces")

	// Get user's workspaces
	pipeline := []bson.M{
		{
			"$lookup": bson.M{
				"from":         "userWorkspaces",
				"localField":   "_id",
				"foreignField": "workspaceId",
				"as":           "userWorkspace",
			},
		},
		{
			"$match": bson.M{
				"userWorkspace.userId": userID,
			},
		},
	}

	if cursor != "" {
		objID, err := primitive.ObjectIDFromHex(cursor)
		if err != nil {
			return nil, err
		}
		pipeline = append(pipeline, bson.M{
			"$match": bson.M{
				"_id": bson.M{"$gt": objID},
			},
		})
	}

	pipeline = append(pipeline,
		bson.M{"$limit": int64(pageSize + 1)}, // Get one extra to check if there are more results
	)

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var workspaces []models.Workspace
	if err = cursor.All(context.Background(), &workspaces); err != nil {
		return nil, err
	}

	// Count total workspaces
	countPipeline := []bson.M{
		{
			"$lookup": bson.M{
				"from":         "userWorkspaces",
				"localField":   "_id",
				"foreignField": "workspaceId",
				"as":           "userWorkspace",
			},
		},
		{
			"$match": bson.M{
				"userWorkspace.userId": userID,
			},
		},
		{
			"$count": "total",
		},
	}

	countCursor, err := collection.Aggregate(context.Background(), countPipeline)
	if err != nil {
		return nil, err
	}
	defer countCursor.Close(context.Background())

	var countResult []bson.M
	if err = countCursor.All(context.Background(), &countResult); err != nil {
		return nil, err
	}

	var totalLength int64
	if len(countResult) > 0 {
		totalLength = countResult[0]["total"].(int64)
	}

	var nextCursor *string
	if len(workspaces) > pageSize {
		workspaces = workspaces[:pageSize]
		lastID := workspaces[len(workspaces)-1].ID
		nextCursor = &lastID
	}

	response := &models.FindWorkspacesResponse{
		Cursor:      nextCursor,
		TotalLength: totalLength,
		Workspaces:  make([]models.WorkspaceResponse, len(workspaces)),
	}

	for i, w := range workspaces {
		response.Workspaces[i] = models.WorkspaceResponse{
			ID:        w.ID,
			Title:     w.Title,
			CreatorID: w.CreatorID,
			CreatedAt: w.CreatedAt,
			UpdatedAt: w.UpdatedAt,
		}
	}

	return response, nil
}

func (s *WorkspaceService) CreateInvitationToken(userID string, workspaceID string, expiredAt *time.Time) (*models.CreateInvitationTokenResponse, error) {
	// Check if user has access to workspace
	collection := s.db.Collection("userWorkspaces")
	var userWorkspace bson.M
	err := collection.FindOne(context.Background(), bson.M{
		"userId":      userID,
		"workspaceId": workspaceID,
	}).Decode(&userWorkspace)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrUnauthorized
		}
		return nil, err
	}

	claims := jwt.MapClaims{
		"sub":       workspaceID,
		"invitedBy": userID,
		"exp":       expiredAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.config.JWTAccessSecret))
	if err != nil {
		return nil, err
	}

	return &models.CreateInvitationTokenResponse{
		InvitationToken: tokenString,
	}, nil
}
