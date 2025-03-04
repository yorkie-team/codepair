package jwt

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

func TestJWTGenerator(t *testing.T) {
	dummyUserID := "dummy_user_id"
	dummyNickname := "dummy_nickname"

	cfg := &config.JWT{
		AccessTokenSecret:          "access-secret",
		RefreshTokenSecret:         "refresh-secret",
		AccessTokenExpirationTime:  15 * time.Minute,
		RefreshTokenExpirationTime: 7 * 24 * time.Hour,
	}

	gen := NewGenerator(cfg)

	t.Run("validate access token test", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(dummyUserID, dummyNickname)
		assert.NoError(t, err)

		parsedToken, err := jwt.ParseWithClaims(token, &Payload{}, func(token *jwt.Token) (
			interface{},
			error,
		) {
			return []byte(cfg.AccessTokenSecret), nil
		})
		assert.NoError(t, err)
		assert.True(t, parsedToken.Valid)

		claims, ok := parsedToken.Claims.(*Payload)
		assert.True(t, ok)
		assert.Equal(t, dummyUserID, claims.Subject)
		assert.Equal(t, dummyNickname, claims.Nickname)
	})

	t.Run("validate refresh token test", func(t *testing.T) {
		token, err := gen.GenerateRefreshToken(dummyUserID)
		assert.NoError(t, err)

		parsedToken, err := jwt.ParseWithClaims(token, &Payload{}, func(token *jwt.Token) (
			interface{},
			error,
		) {
			return []byte(cfg.RefreshTokenSecret), nil
		})

		assert.NoError(t, err)
		assert.True(t, parsedToken.Valid)

		claims, ok := parsedToken.Claims.(*Payload)
		assert.True(t, ok)
		assert.Equal(t, dummyUserID, claims.Subject)
	})
}
