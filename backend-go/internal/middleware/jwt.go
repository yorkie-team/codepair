package middleware

import (
	"errors"
	"net/http"

	gojwt "github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/jwt"
)

var PublicPath = map[string]bool{
	"/auth/refresh":         true,
	"/auth/login/github":    true,
	"/auth/callback/github": true,
}

// JWT returns a middleware that checks the JWT token.
func JWT(tokenSecret string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		Skipper: func(c echo.Context) bool {
			_, exists := PublicPath[c.Request().URL.Path]
			return exists
		},
		SigningKey: []byte(tokenSecret),
		NewClaimsFunc: func(_ echo.Context) gojwt.Claims {
			return new(jwt.Payload)
		},
		TokenLookup: "header:Authorization:Bearer ",
		ErrorHandler: func(_ echo.Context, err error) error {
			if errors.Is(err, gojwt.ErrTokenExpired) {
				return NewError(http.StatusUnauthorized, "Token has expired.")
			} else if errors.Is(err, gojwt.ErrTokenMalformed) || errors.Is(err, gojwt.ErrTokenSignatureInvalid) {
				return NewError(http.StatusUnauthorized, "Invalid token")
			}
			return NewError(http.StatusForbidden, "Access denied")
		},
	})
}
