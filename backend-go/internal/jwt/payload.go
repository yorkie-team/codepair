package jwt

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// ClaimsKey is the key to retrieve the claims in the echo context.
const ClaimsKey = "user"

var (
	ErrInvalidToken       = errors.New("invalid token")
	ErrInvalidTokenClaims = errors.New("invalid token claims")
)

type Payload struct {
	jwt.RegisteredClaims
}

// GetPayload returns the payload from the echo context.
func GetPayload(c echo.Context) (*Payload, error) {
	claims, ok := c.Get(ClaimsKey).(*jwt.Token)
	if !ok {
		return nil, ErrInvalidToken
	}

	payload, ok := claims.Claims.(*Payload)
	if !ok {
		return nil, ErrInvalidTokenClaims
	}
	return payload, nil
}
