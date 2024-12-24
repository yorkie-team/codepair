package services

import (
	"context"
	"fmt"
	"time"

	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserService struct {
	db *mongo.Database
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{
		db: db,
	}
}

func (s *UserService) FindByID(userID string) (*models.User, error) {
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) FindBySocialID(provider, socialUID string) (*models.User, error) {
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{
		"socialProvider": provider,
		"socialUid":      socialUID,
	}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) Create(provider, socialUID, nickname string) (*models.User, error) {
	// Check if nickname exists
	count, err := s.db.Collection("users").CountDocuments(context.Background(), bson.M{
		"nickname": nickname,
	})
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, fmt.Errorf("nickname already exists")
	}

	user := &models.User{
		ID:             generateID(),
		SocialProvider: provider,
		SocialUID:      socialUID,
		Nickname:       nickname,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = s.db.Collection("users").InsertOne(context.Background(), user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) ChangeNickname(userID, nickname string) error {
	// Check if nickname exists
	count, err := s.db.Collection("users").CountDocuments(context.Background(), bson.M{
		"_id":      bson.M{"$ne": userID},
		"nickname": nickname,
	})
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("nickname already exists")
	}

	result := s.db.Collection("users").FindOneAndUpdate(
		context.Background(),
		bson.M{"_id": userID},
		bson.M{
			"$set": bson.M{
				"nickname":  nickname,
				"updatedAt": time.Now(),
			},
		},
	)

	if result.Err() != nil {
		return result.Err()
	}

	return nil
}

func generateID() string {
	// Implementation for generating unique ID
	return ""
}
