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

type DocumentService struct {
	db     *mongo.Database
	config *config.Config
}

func NewDocumentService(db *mongo.Database, cfg *config.Config) *DocumentService {
	return &DocumentService{
		db:     db,
		config: cfg,
	}
}

func (s *DocumentService) Create(userID, workspaceID, title string) (*models.Document, error) {
	// Check if user has access to workspace
	err := s.checkWorkspaceAccess(userID, workspaceID)
	if err != nil {
		return nil, err
	}

	document := &models.Document{
		Title:       title,
		WorkspaceID: workspaceID,
		CreatorID:   userID,
		Content:     "",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	collection := s.db.Collection("documents")
	result, err := collection.InsertOne(context.Background(), document)
	if err != nil {
		return nil, err
	}

	document.ID = result.InsertedID.(primitive.ObjectID).Hex()
	return document, nil
}

func (s *DocumentService) UpdateTitle(userID, documentID, title string) error {
	collection := s.db.Collection("documents")

	// Find document and check access
	var document models.Document
	err := collection.FindOne(context.Background(), bson.M{"_id": documentID}).Decode(&document)
	if err != nil {
		return err
	}

	err = s.checkWorkspaceAccess(userID, document.WorkspaceID)
	if err != nil {
		return err
	}

	// Update title
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": documentID},
		bson.M{
			"$set": bson.M{
				"title":     title,
				"updatedAt": time.Now(),
			},
		},
	)
	return err
}

func (s *DocumentService) CreateShareToken(userID, documentID string, expiredAt *time.Time) (*models.CreateDocumentShareTokenResponse, error) {
	// Check document access
	collection := s.db.Collection("documents")
	var document models.Document
	err := collection.FindOne(context.Background(), bson.M{"_id": documentID}).Decode(&document)
	if err != nil {
		return nil, err
	}

	err = s.checkWorkspaceAccess(userID, document.WorkspaceID)
	if err != nil {
		return nil, err
	}

	// Create token
	claims := jwt.MapClaims{
		"sub":      documentID,
		"sharedBy": userID,
		"exp":      expiredAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.config.JWTAccessSecret))
	if err != nil {
		return nil, err
	}

	return &models.CreateDocumentShareTokenResponse{
		SharingToken: tokenString,
	}, nil
}

func (s *DocumentService) FindFromSharingToken(tokenString string) (*models.FindDocumentFromSharingTokenResponse, error) {
	// Validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.config.JWTAccessSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrUnauthorized
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrUnauthorized
	}

	documentID := claims["sub"].(string)

	// Find document
	collection := s.db.Collection("documents")
	var document models.Document
	err = collection.FindOne(context.Background(), bson.M{"_id": documentID}).Decode(&document)
	if err != nil {
		return nil, err
	}

	return &models.FindDocumentFromSharingTokenResponse{
		Document: document,
	}, nil
}

func (s *DocumentService) checkWorkspaceAccess(userID, workspaceID string) error {
	collection := s.db.Collection("userWorkspaces")
	var userWorkspace bson.M
	err := collection.FindOne(context.Background(), bson.M{
		"userId":      userID,
		"workspaceId": workspaceID,
	}).Decode(&userWorkspace)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrUnauthorized
		}
		return err
	}

	return nil
}
