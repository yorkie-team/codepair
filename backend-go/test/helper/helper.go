package helper

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

// NewTestEcho returns a new Echo instance with a temporary listener.
func NewTestEcho(t *testing.T) *echo.Echo {
	t.Helper()
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
	conf := &config.Config{}
	conf.EnsureDefaultValue()
	conf.Mongo.ConnectionURI = "mongodb://localhost:27017"
	conf.Mongo.DatabaseName = fmt.Sprintf("test-codepair-%s-%d", testName, rand.Int())
	conf.OAuth.FrontendBaseURL = "http://frontend-url"
	return conf
}

// SetupTestServer creates a new Echo instance and server for integration tests.
// It starts the server in a background goroutine and returns both the server and the GitHub test server.
func SetupTestServer(t *testing.T, conf *config.Config) *server.CodePair {
	t.Helper()
	e := NewTestEcho(t)
	backendURL := fmt.Sprintf("http://localhost:%d", e.Listener.Addr().(*net.TCPAddr).Port)
	githubServer, githubConf := NewTestGithubServer(t, backendURL)
	conf.OAuth.Github = githubConf
	codePairServer, err := server.New(e, conf)
	assert.NoError(t, err)

	// Start the server in a background goroutine.
	go func() {
		assert.NoError(t, codePairServer.Start())
	}()

	// Ensure the server is shut down at the end of the test.
	t.Cleanup(func() {
		githubServer.Close()
		assert.NoError(t, codePairServer.Shutdown(context.Background()))
	})

	return codePairServer
}

// LoginUserTestGithub ensures that a default user exists via GitHub login and returns the user along with the access token.
func LoginUserTestGithub(t *testing.T, socialID, backendURL string) (entity.User, string) {
	t.Helper()

	// Use a custom redirect checker to stop at the frontend URL.
	client := http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			switch len(via) {
			case 1:
				// First request, It redirects to the GitHub authorization URL.
				req.Header.Set("socialID", socialID)
				return nil
			case 2:
				// Second request, It redirects to the backend /auth/callback/github with the code.
				return nil
			case 3:
				// Third request, It redirects to the frontend URL with the access token.
				// This is where we want to stop the redirect chain.
				return http.ErrUseLastResponse
			default:
				// If there are more than 2 redirects, we want to stop the redirect chain.
				return http.ErrUseLastResponse
			}
		},
	}

	resp, err := client.Get(backendURL + "/auth/login/github")
	assert.Error(t, http.ErrUseLastResponse, err)
	redirectedURL, err := url.Parse(resp.Header.Get("Location"))
	assert.NoError(t, err)

	// Extract the access token from the redirected URL's query parameter.
	accessToken := redirectedURL.Query().Get("accessToken")
	status, body := DoRequest(t, http.MethodGet, backendURL+"/users", accessToken, nil)
	assert.Equal(t, http.StatusOK, status)

	var resData models.FindUserResponse
	assert.NoError(t, json.Unmarshal(body, &resData))

	return entity.User{
		ID:        entity.ID(resData.Id),
		Nickname:  resData.Nickname,
		CreatedAt: resData.CreatedAt,
		UpdatedAt: resData.UpdatedAt,
	}, accessToken
}

// DoRequest creates and sends an HTTP request, returning the response status code and body.
// It automatically sets the authorization and content-type headers (if a body is provided).
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
