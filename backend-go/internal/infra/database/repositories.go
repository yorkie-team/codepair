package database

import (
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
)

type Repositories struct {
	Hello *mongodb.HelloRepository
	User  *mongodb.UserRepository
}

func NewRepositories(conf *config.Mongo, db *mongo.Client) *Repositories {
	return &Repositories{
		Hello: mongodb.NewHelloRepository(conf, db),
		User:  mongodb.NewUserRepository(conf, db),
	}
}
