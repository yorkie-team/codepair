package services

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type WorkspaceService struct {
	db  *mongo.Database
	cfg *config.Config
}

func NewWorkspaceService(db *mongo.Database, cfg *config.Config) *WorkspaceService {
	return &WorkspaceService{
		db:  db,
		cfg: cfg,
	}
}

func (s *WorkspaceService) Create(userID, title string) (*models.Workspace, error) {
	workspace := &models.Workspace{
		ID:        primitive.NewObjectID().Hex(),
		Title:     title,
		Slug:      generateSlug(title),
		OwnerID:   userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := s.db.Collection("workspaces").InsertOne(context.Background(), workspace)
	if err != nil {
		return nil, err
	}

	return workspace, nil
}

func (s *WorkspaceService) List(userID string) ([]models.Workspace, error) {
	cursor, err := s.db.Collection("workspaces").Find(context.Background(), bson.M{
		"$or": []bson.M{
			{"ownerId": userID},
			{"members": userID},
		},
	})
	if err != nil {
		return nil, err
	}

	var workspaces []models.Workspace
	if err = cursor.All(context.Background(), &workspaces); err != nil {
		return nil, err
	}

	return workspaces, nil
}

func (s *WorkspaceService) Get(workspaceID, userID string) (*models.Workspace, error) {
	var workspace models.Workspace
	err := s.db.Collection("workspaces").FindOne(context.Background(), bson.M{
		"_id": workspaceID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"members": userID},
		},
	}).Decode(&workspace)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("workspace not found")
		}
		return nil, err
	}

	return &workspace, nil
}

func (s *WorkspaceService) CreateInvitationToken(workspaceID, userID string) (string, error) {
	// Verify user has access to workspace
	workspace, err := s.Get(workspaceID, userID)
	if err != nil {
		return "", err
	}

	// Create JWT token
	claims := jwt.MapClaims{
		"workspaceId": workspace.ID,
		"exp":         time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func generateSlug(title string) string {
	// Implementation for generating slug from title
	return ""
}
