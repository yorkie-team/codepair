package services

import (
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
)

type SettingsService struct {
	db     *mongo.Database
	config *config.Config
}

func NewSettingsService(db *mongo.Database, cfg *config.Config) *SettingsService {
	return &SettingsService{
		db:     db,
		config: cfg,
	}
}

func (s *SettingsService) GetSettings() (*models.SettingsResponse, error) {
	settings := &models.Settings{
		GithubClientID:    s.config.GithubClientID,
		GithubCallbackURL: s.config.GithubCallbackURL,
	}

	return &models.SettingsResponse{
		Settings: *settings,
	}, nil
}
