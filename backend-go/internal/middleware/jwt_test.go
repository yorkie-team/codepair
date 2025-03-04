package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	gojwt "github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
)

func TestJWTMiddleware(t *testing.T) {
	dummyUserID := "dummy_user_id"
	dummyNickname := "dummy_nickname"

	cfg := &config.JWT{
		AccessTokenSecret:          "access-secret",
		RefreshTokenSecret:         "refresh-secret",
		AccessTokenExpirationTime:  15 * time.Minute,
		RefreshTokenExpirationTime: 7 * 24 * time.Hour,
	}

	gen := jwt.NewGenerator(cfg)

	mw := JWT(cfg.AccessTokenSecret)

	e := echo.New()
	e.Use(mw)

	e.GET("/protected", func(c echo.Context) error {
		claims, ok := c.Get("user").(*gojwt.Token)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
		}

		payload, ok := claims.Claims.(*Payload)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid token claims")
		}

		return fmt.Errorf("http ok: %w",
			c.JSON(http.StatusOK, map[string]string{
				"userID":   payload.Subject,
				"nickname": payload.Nickname,
			}))
	})

	t.Run("valid token test", func(t *testing.T) {
		validToken, err := gen.GenerateAccessToken(dummyUserID, dummyNickname)
		assert.NoError(t, err)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+validToken)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), dummyUserID)
		assert.Contains(t, rec.Body.String(), dummyNickname)
	})

	t.Run("invalid token test", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid_token")
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("missing token test", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}
