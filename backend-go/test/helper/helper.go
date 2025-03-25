package helper

import (
	"context"
	"errors"
	"fmt"
	"net"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

// NewTestEcho returns a new Echo instance with a temporary listener.
func NewTestEcho(t *testing.T) *echo.Echo {
	listener, err := net.Listen("tcp", ":0")
	assert.NoError(t, err)

	e := echo.New()
	e.Logger.SetHeader("${level} ${time_rfc3339}")
	e.Listener = listener
	return e
}

// NewTestConfig creates and returns a configuration with default values for testing.
func NewTestConfig(testName string) *config.Config {
	cfg := &config.Config{}
	cfg.EnsureDefaultValue()
	cfg.Mongo.ConnectionURI = "mongodb://localhost:27017"
	cfg.Mongo.DatabaseName = fmt.Sprintf("test-codepair-%s-%d", testName, time.Now().Unix())

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
	if err != nil && errors.Is(err, database.ErrDuplicatedKey) {
		return entity.User{}, err
	}
	return userRepo.FindUser(id)
}

// SetupTestServer creates a new Echo instance and server for integration tests.
// It starts the server in a background goroutine and returns both the server and Echo instance.
func SetupTestServer(t *testing.T, conf *config.Config, e *echo.Echo) *server.CodePair {
	svr, err := server.New(e, conf)
	assert.NoError(t, err)

	go func() {
		assert.NoError(t, svr.Start())
	}()

	t.Cleanup(func() {
		assert.NoError(t, svr.Shutdown(context.Background()))
	})

	return svr
}

// SetupDefaultUser ensures that a default user exists and returns the user.
func SetupDefaultUser(t *testing.T, conf *config.Config, logger echo.Logger) entity.User {
	user, err := EnsureDefaultUser(conf.Mongo, logger)
	assert.NoError(t, err)
	return user
}
