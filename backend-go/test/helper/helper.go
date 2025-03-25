package helper

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"net"
)

func NewTestEcho() (*echo.Echo, error) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return nil, err
	}

	e := echo.New()
	e.Listener = listener
	return e, nil
}

// NewTestConfig creates and returns a configuration with default values for testing.
func NewTestConfig() *config.Config {
	cfg := &config.Config{}
	cfg.EnsureDefaultValue()
	return cfg
}

// EnsureDefaultUser ensures that a default user exists in the database.
// It creates the user via the social provider "github" and returns the created user.
func EnsureDefaultUser(mongoCfg *config.Mongo, logger echo.Logger) (entity.User, error) {
	cli, err := mongodb.Dial(mongoCfg, logger)
	if err != nil {
		return entity.User{}, err
	}
	userRepo := mongodb.NewUserRepository(mongoCfg, cli)

	id, err := userRepo.CreateUserBySocial("github", "testUser")
	if err != nil {
		return entity.User{}, err
	}
	return userRepo.FindUser(id)
}
