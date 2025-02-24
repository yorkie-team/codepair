package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

type Generator struct {
	c *config.JWT
}

func NewGenerator(c *config.JWT) *Generator {
	return &Generator{c: c}
}

type Payload struct {
	Nickname string `json:"nickname,omitempty"`
	jwt.RegisteredClaims
}

func (g *Generator) GenerateAccessToken(userID, nickname string) (string, error) {
	claims := Payload{
		Nickname: nickname,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(g.c.AccessTokenExpirationTime)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(g.c.AccessTokenSecret))
	if err != nil {
		return "", fmt.Errorf("sign access token: %w", err)
	}

	return signedToken, nil
}

func (g *Generator) GenerateRefreshToken(userID string) (string, error) {
	claims := Payload{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(g.c.RefreshTokenExpirationTime)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(g.c.RefreshTokenSecret))
	if err != nil {
		return "", fmt.Errorf("sign refresh token: %w", err)
	}

	return signedToken, nil
}
