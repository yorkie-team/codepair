package jwt

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// ClaimsKey is the key to retrieve the claims in the echo context.
const ClaimsKey = "user"

type Payload struct {
	Nickname string `json:"nickname,omitempty"`
	jwt.RegisteredClaims
}

// GetPayload returns the payload from the echo context.
func GetPayload(c echo.Context) (*Payload, error) {
	claims, ok := c.Get(ClaimsKey).(*jwt.Token)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	payload, ok := claims.Claims.(*Payload)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "invalid token claims")
	}
	return payload, nil
}
