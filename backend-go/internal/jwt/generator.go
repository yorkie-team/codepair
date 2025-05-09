package jwt

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

var (
	ErrTokenExpired = errors.New("token expired")
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

// ParseRefreshToken generates a new access token from a valid refresh token.
func (g *Generator) ParseRefreshToken(refreshToken string) (string, error) {
	token, err := jwt.ParseWithClaims(refreshToken, &Payload{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(g.cfg.RefreshTokenSecret), nil
	})
	if err != nil {
		return "", fmt.Errorf("parse refresh token: %w", err)
	}

	claims, ok := token.Claims.(*Payload)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid refresh token")
	}

	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
		return "", ErrTokenExpired
	}

	return claims.Subject, nil
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
