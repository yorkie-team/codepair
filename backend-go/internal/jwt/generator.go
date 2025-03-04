package jwt

import (
	"fmt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

type Generator struct {
	cfg *config.JWT
}

// NewGenerator creates a new Generator.
func NewGenerator(cfg *config.JWT) *Generator {
	return &Generator{cfg: cfg}
}

// GenerateAccessToken generates an access token with the given user ID and nickname.
func (g *Generator) GenerateAccessToken(userID, nickname string) (string, error) {
	claims := middleware.Payload{
		Nickname: nickname,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(g.cfg.AccessTokenExpirationTime)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(g.cfg.AccessTokenSecret))
	if err != nil {
		return "", fmt.Errorf("sign access token: %w", err)
	}

	return signedToken, nil
}

// GenerateRefreshToken generates a refresh token with the given user ID.
func (g *Generator) GenerateRefreshToken(userID string) (string, error) {
	claims := middleware.Payload{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(g.cfg.RefreshTokenExpirationTime)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(g.cfg.RefreshTokenSecret))
	if err != nil {
		return "", fmt.Errorf("sign refresh token: %w", err)
	}

	return signedToken, nil
}
