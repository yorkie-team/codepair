package helper

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
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
	listener, err := net.Listen("tcp", ":0") // #nosec G102
	assert.NoError(t, err)

	e := echo.New()
	e.Logger.SetHeader("${level} ${time_rfc3339}")
	e.HideBanner = true
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
	// TODO(window9u): Replace Mongo Dial to create user api
	cli, err := mongodb.Dial(conf.Mongo, logger)
	assert.NoError(t, err)
	userRepo := mongodb.NewUserRepository(conf.Mongo, cli)

	id, err := userRepo.CreateUserBySocial("github", "testUser")
	if err != nil && errors.Is(err, database.ErrDuplicatedKey) {
		assert.NoError(t, err)
	}

	user, err := userRepo.FindUser(id)
	assert.NoError(t, err)
	return user
}

// DoRequest creates and sends an HTTP request, then returns the response status code and body.
// It also handles setting common headers and closing the response body.
func DoRequest(t *testing.T, method, url, token string, body io.Reader) (int, []byte) {
	t.Helper()
	req, err := http.NewRequest(method, url, body)
	assert.NoError(t, err)
	req.Header.Set("Authorization", "Bearer "+token)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{}
	res, err := client.Do(req)
	assert.NoError(t, err)
	defer func() {
		assert.NoError(t, res.Body.Close())
	}()
	respBody, err := io.ReadAll(res.Body)
	assert.NoError(t, err)
	return res.StatusCode, respBody
}
