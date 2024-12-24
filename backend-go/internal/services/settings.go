package services

import (
	"context"
	"time"

	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SettingsService struct {
	db *mongo.Database
}

func NewSettingsService(db *mongo.Database) *SettingsService {
	return &SettingsService{
		db: db,
	}
}

func (s *SettingsService) GetSettings(userID string) (*models.Settings, error) {
	settings := &models.Settings{}
	err := s.db.Collection("settings").FindOne(context.Background(), bson.M{
		"userId": userID,
	}).Decode(settings)

	if err == mongo.ErrNoDocuments {
		// Return default settings if none exist
		return &models.Settings{
			UserID:   userID,
			Theme:    "light",
			Language: "en",
			KeyMap:   "default",
		}, nil
	}

	if err != nil {
		return nil, err
	}

	return settings, nil
}

func (s *SettingsService) UpdateSettings(userID string, req *models.UpdateSettingsRequest) (*models.Settings, error) {
	update := bson.M{
		"$set": bson.M{
			"theme":     req.Theme,
			"language":  req.Language,
			"keyMap":    req.KeyMap,
			"updatedAt": time.Now(),
		},
	}

	result := s.db.Collection("settings").FindOneAndUpdate(
		context.Background(),
		bson.M{"userId": userID},
		update,
		mongo.options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(mongo.options.After),
	)

	settings := &models.Settings{}
	if err := result.Decode(settings); err != nil {
		return nil, err
	}

	return settings, nil
}
