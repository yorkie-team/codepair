package middleware

import (
	"errors"
	"net/http"

	gojwt "github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/jwt"
)

// JWT returns a middleware that checks the JWT token.
func JWT(tokenSecret string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(tokenSecret),
		NewClaimsFunc: func(c echo.Context) gojwt.Claims {
			return new(jwt.Payload)
		},
		TokenLookup: "header:Authorization:Bearer ",
		ErrorHandler: func(c echo.Context, err error) error {
			// TODO(kokodak): When introducing an error handler, the error spec needs to be adjusted accordingly.
			if errors.Is(err, gojwt.ErrTokenExpired) {
				return echo.NewHTTPError(http.StatusUnauthorized, "Token has expired.")
			} else if errors.Is(err, gojwt.ErrTokenMalformed) || errors.Is(err, gojwt.ErrTokenSignatureInvalid) {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
			}
			return echo.NewHTTPError(http.StatusForbidden, "Access denied")
		},
	})
}
