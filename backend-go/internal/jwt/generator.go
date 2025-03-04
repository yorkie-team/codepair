package jwt

import (
	"fmt"
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

// GenerateAccessToken generates an access token with the given subject.
func (g *Generator) GenerateAccessToken(subject string) (string, error) {
	return g.generateToken(
		subject,
		g.cfg.AccessTokenSecret,
		g.cfg.AccessTokenExpirationTime,
	)
}

// GenerateRefreshToken generates a refresh token with the given subject.
func (g *Generator) GenerateRefreshToken(subject string) (string, error) {
	return g.generateToken(
		subject,
		g.cfg.RefreshTokenSecret,
		g.cfg.RefreshTokenExpirationTime,
	)
}

func (g *Generator) generateToken(subject, secretKey string, tokenTTL time.Duration) (string, error) {
	claims := Payload{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   subject,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenTTL)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}

	return signedToken, nil
}
