package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
)

func TestJWTMiddleware(t *testing.T) {
	const (
		dummyUserID                = "dummy_user_id"
		accessTokenSecret          = "access-secret"
		refreshTokenSecret         = "refresh-secret"
		accessTokenExpirationTime  = 1 * time.Second
		refreshTokenExpirationTime = 2 * time.Second
	)

	cfg := &config.JWT{
		AccessTokenSecret:          accessTokenSecret,
		RefreshTokenSecret:         refreshTokenSecret,
		AccessTokenExpirationTime:  accessTokenExpirationTime,
		RefreshTokenExpirationTime: refreshTokenExpirationTime,
	}

	gen := jwt.NewGenerator(cfg)
	mw := JWT(cfg.AccessTokenSecret)

	e := echo.New()
	e.Use(mw)
	e.HTTPErrorHandler = HTTPErrorHandler

	type response struct {
		UserID string `json:"user_id"`
	}

	e.GET("/protected", func(c echo.Context) error {
		payload, err := jwt.GetPayload(c)
		assert.NoError(t, err)

		return c.JSON(http.StatusOK, &response{
			UserID: payload.Subject,
		})
	})

	t.Run("valid token test", func(t *testing.T) {
		validToken, err := gen.GenerateAccessToken(dummyUserID)
		assert.NoError(t, err)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+validToken)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		res := &response{}
		assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), res))
		assert.Equal(t, dummyUserID, res.UserID)
	})

	t.Run("invalid token test", func(t *testing.T) {
		// This test uses a simple invalid token.
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid_token")
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		// The error handler should return a 401 Unauthorized status.
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("expired token test", func(t *testing.T) {
		validToken, err := gen.GenerateAccessToken(dummyUserID)
		assert.NoError(t, err)
		time.Sleep(accessTokenExpirationTime)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+validToken)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		res := &models.HttpExceptionResponse{}
		assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), res))
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Equal(t, res.Message, "Token has expired.")
	})

	t.Run("missing token test", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusForbidden, rec.Code)
	})
}
