package settings

import (
	"context"
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

type Service struct {
	db *mongo.Database
}

func NewService(db *mongo.Database) *Service {
	return &Service{
		db: db,
	}
}

func (s *Service) GetSettings(userID string) (*models.Settings, error) {
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

func (s *Service) UpdateSettings(userID string, req *models.UpdateSettingsRequest) (*models.Settings, error) {
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
