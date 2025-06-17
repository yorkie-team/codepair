package integration

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestRefreshToken(t *testing.T) {
	const (
		accessTokenExpirationTime  = 1 * time.Second
		refreshTokenExpirationTime = 2 * time.Second
		getUserPath                = "/users"
		refreshPath                = "/auth/refresh"
	)

	conf := helper.NewTestConfig(t.Name())
	conf.JWT.AccessTokenExpirationTime = accessTokenExpirationTime
	conf.JWT.RefreshTokenExpirationTime = refreshTokenExpirationTime
	codePair := helper.SetupTestServer(t)
	getUserURL := codePair.ServerAddr() + getUserPath
	refreshURL := codePair.ServerAddr() + refreshPath

	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		err := mongo.Disconnect(context.Background())
		assert.NoError(t, err)
	}()

	t.Run("login with github and access token expired", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		_, access, refresh := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
		status, _ := helper.DoRequest(t, http.MethodGet, getUserURL, access, nil)
		assert.Equal(t, http.StatusOK, status)

		time.Sleep(accessTokenExpirationTime)
		status, _ = helper.DoRequest(t, http.MethodGet, getUserURL, access, nil)
		assert.Equal(t, http.StatusUnauthorized, status)

		body, err := json.Marshal(models.RefreshTokenRequest{
			RefreshToken: refresh,
		})
		assert.NoError(t, err)
		status, res := helper.DoRequest(t, http.MethodPost, refreshURL, "", body)
		assert.Equal(t, http.StatusOK, status)

		var resp models.RefreshTokenResponse
		err = json.Unmarshal(res, &resp)
		assert.NoError(t, err)

		status, _ = helper.DoRequest(t, http.MethodGet, getUserURL, resp.NewAccessToken, nil)
		assert.Equal(t, http.StatusOK, status)
	})

	t.Run("login with github and refresh token expired", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		_, _, refresh := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

		time.Sleep(refreshTokenExpirationTime)
		body, err := json.Marshal(models.RefreshTokenRequest{
			RefreshToken: refresh,
		})
		assert.NoError(t, err)
		status, _ := helper.DoRequest(t, http.MethodPost, refreshURL, "", body)
		assert.Equal(t, http.StatusUnauthorized, status)

		// Login again to get a new refresh token
		_, access, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
		status, _ = helper.DoRequest(t, http.MethodGet, getUserURL, access, nil)
		assert.Equal(t, http.StatusOK, status)
	})
}
