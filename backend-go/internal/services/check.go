package services

import (
	"context"
	"fmt"
	"net/http"

	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type CheckService struct {
	db            *mongo.Database
	config        *config.Config
	yorkieBaseURL string
}

func NewCheckService(db *mongo.Database, cfg *config.Config) *CheckService {
	return &CheckService{
		db:            db,
		config:        cfg,
		yorkieBaseURL: cfg.YorkieAPIAddr,
	}
}

func (s *CheckService) CheckNameConflict(name string, workspaceID string) (bool, error) {
	collection := s.db.Collection("documents")
	count, err := collection.CountDocuments(context.Background(), bson.M{
		"title":       name,
		"workspaceId": workspaceID,
	})

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (s *CheckService) CheckYorkie(documentKey string) (string, error) {
	// Make a request to Yorkie server to check document status
	resp, err := http.Get(fmt.Sprintf("%s/documents/%s", s.yorkieBaseURL, documentKey))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return "active", nil
	}
	return "inactive", nil
}
