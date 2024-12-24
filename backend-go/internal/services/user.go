package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserService struct {
	db     *mongo.Database
	config *config.Config
}

func NewUserService(db *mongo.Database, cfg *config.Config) *UserService {
	return &UserService{
		db:     db,
		config: cfg,
	}
}

func (s *UserService) GetGithubAccessToken(code string) (string, error) {
	url := "https://github.com/login/oauth/access_token"
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return "", err
	}

	q := req.URL.Query()
	q.Add("client_id", s.config.GithubClientID)
	q.Add("client_secret", s.config.GithubClientSecret)
	q.Add("code", code)
	req.URL.RawQuery = q.Encode()

	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.AccessToken, nil
}

func (s *UserService) GetGithubUser(accessToken string) (*models.GithubUser, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("token %s", accessToken))
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user models.GithubUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) UpsertUser(githubUser *models.GithubUser) (*models.User, error) {
	collection := s.db.Collection("users")

	filter := bson.M{"socialUid": githubUser.ID, "socialProvider": "github"}
	update := bson.M{
		"$set": bson.M{
			"nickname":  githubUser.Login,
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"createdAt": time.Now(),
		},
	}
	opts := options.Update().SetUpsert(true)

	result, err := collection.UpdateOne(context.Background(), filter, update, opts)
	if err != nil {
		return nil, err
	}

	var user models.User
	if result.UpsertedID != nil {
		user = models.User{
			ID:             result.UpsertedID.(primitive.ObjectID).Hex(),
			Nickname:       githubUser.Login,
			SocialProvider: "github",
			SocialUid:      githubUser.ID,
		}
	} else {
		err = collection.FindOne(context.Background(), filter).Decode(&user)
		if err != nil {
			return nil, err
		}
	}

	return &user, nil
}
