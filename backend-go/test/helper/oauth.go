package helper

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

const (
	githubClientID         = "test-client-id"
	githubClientSecret     = "test-client-secret"
	githubRedirectURL      = "/auth/github/callback"
	githubAuthorizationURL = "/auth/github/authorize"
	githubTokenURL         = "/auth/github/token" // #nosec G101
	githubUserURL          = "/user"
)

// NewTestGithubServer creates a new test server for GitHub authentication.
func NewTestGithubServer(t *testing.T, backendURL string) (*httptest.Server, *config.Github) {
	t.Helper()

	mux := http.NewServeMux()

	// Authorization endpoint: validates the client_id and issues a redirect with a test code.
	// This is endpoint is used to simulate the GitHub authorization process by user.
	mux.HandleFunc(githubAuthorizationURL, func(w http.ResponseWriter, r *http.Request) {
		t.Helper()
		assert.Equal(t, githubClientID, r.URL.Query().Get("client_id"))
		ID := r.Header.Get("socialID")
		redirect := fmt.Sprintf("%s/auth/callback/github?code=%s", backendURL, ID)
		w.Header().Set("Location", redirect)
		w.WriteHeader(http.StatusTemporaryRedirect)
	})

	// Token endpoint: validates the Authorization header and returns a JSON access token.
	// This endpoint is used to simulate the GitHub token exchange process for Backend.
	mux.HandleFunc(githubTokenURL, func(w http.ResponseWriter, r *http.Request) {
		t.Helper()
		expectedAuth := "Basic " + base64.StdEncoding.EncodeToString([]byte(githubClientID+":"+githubClientSecret))
		assert.Equal(t, expectedAuth, r.Header.Get("Authorization"))
		assert.Equal(t, "application/x-www-form-urlencoded", r.Header.Get("Content-Type"))
		ID := r.FormValue("code")

		w.Header().Set("Content-Type", "application/json")
		accessToken := struct {
			AccessToken string `json:"access_token"`
			TokenType   string `json:"token_type"`
		}{
			AccessToken: ID,
			TokenType:   "bearer",
		}

		body, err := json.Marshal(accessToken)
		assert.NoError(t, err)
		_, err = w.Write(body)
		assert.NoError(t, err)
	})

	// User endpoint: returns a JSON with a user id.
	// This endpoint is used to simulate the GitHub user profile retrieval process for Backend.
	mux.HandleFunc(githubUserURL, func(w http.ResponseWriter, r *http.Request) {
		t.Helper()
		w.Header().Set("Content-Type", "application/json")
		accessToken := r.Header.Get("Authorization")
		// Remove "Bearer " prefix from the token.
		id := accessToken[len("Bearer "):]
		user := struct {
			ID string `json:"id"`
		}{ID: id}

		res, err := json.Marshal(user)
		assert.NoError(t, err)
		_, err = w.Write(res)
		assert.NoError(t, err)
	})

	testServer := httptest.NewServer(mux)
	githubConf := &config.Github{
		ClientID:         githubClientID,
		ClientSecret:     githubClientSecret,
		CallbackURL:      testServer.URL + githubRedirectURL,
		AuthorizationURL: testServer.URL + githubAuthorizationURL,
		TokenURL:         testServer.URL + githubTokenURL,
		UserProfileURL:   testServer.URL + githubUserURL,
	}

	return testServer, githubConf
}
