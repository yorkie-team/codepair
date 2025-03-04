package middleware

import (
	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

type Payload struct {
	Nickname string `json:"nickname,omitempty"`
	jwt.RegisteredClaims
}

// JWT returns a middleware that checks the JWT token.
func JWT(tokenSecret string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(tokenSecret),
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(Payload)
		},
		TokenLookup: "header:Authorization:Bearer ",
	})
}
