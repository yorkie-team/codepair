package document

import (
	"context"
	"fmt"
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	db  *mongo.Database
	cfg *server.Config
}

func NewService(db *mongo.Database, cfg *server.Config) *Service {
	return &Service{
		db:  db,
		cfg: cfg,
	}
}

func (s *Service) Create(userID, workspaceID, title string) (*models.Document, error) {
	// Verify user has access to workspace
	workspace := &models.Workspace{}
	err := s.db.Collection("workspaces").FindOne(context.Background(), bson.M{
		"_id": workspaceID,
		"$or": []bson.M{
			{"ownerId": userID},
			{"members": userID},
		},
	}).Decode(workspace)

	if err != nil {
		return nil, fmt.Errorf("unauthorized access to workspace")
	}

	document := &models.Document{
		ID:          primitive.NewObjectID().Hex(),
		Title:       title,
		WorkspaceID: workspaceID,
		CreatorID:   userID,
		Content:     "",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = s.db.Collection("documents").InsertOne(context.Background(), document)
	if err != nil {
		return nil, err
	}

	return document, nil
}

func (s *Service) UpdateTitle(documentID, userID, title string) error {
	result := s.db.Collection("documents").FindOneAndUpdate(
		context.Background(),
		bson.M{
			"_id":       documentID,
			"creatorId": userID,
		},
		bson.M{
			"$set": bson.M{
				"title":     title,
				"updatedAt": time.Now(),
			},
		},
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			return fmt.Errorf("document not found or unauthorized")
		}
		return result.Err()
	}

	return nil
}

func (s *Service) CreateShareToken(documentID, userID string) (string, error) {
	// Verify user has access to document
	doc := &models.Document{}
	err := s.db.Collection("documents").FindOne(context.Background(), bson.M{
		"_id":       documentID,
		"creatorId": userID,
	}).Decode(doc)

	if err != nil {
		return "", fmt.Errorf("document not found or unauthorized")
	}

	// Create JWT token
	claims := jwt.MapClaims{
		"documentId": documentID,
		"exp":        time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *Service) FindFromSharingToken(tokenString string) (*models.Document, error) {
	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid sharing token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	documentID, ok := claims["documentId"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid document ID in token")
	}

	// Fetch document
	doc := &models.Document{}
	err = s.db.Collection("documents").FindOne(context.Background(), bson.M{
		"_id": documentID,
	}).Decode(doc)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("document not found")
		}
		return nil, err
	}

	return doc, nil
}
