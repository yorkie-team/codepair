package middleware

import (
	"context"
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const AuthUserContextKey contextKey = "user"

type JWTClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

func JWT(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for public endpoints
			if isPublicPath(r.URL.Path) {
				next.ServeHTTP(w, r)
				return
			}

			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Extract claims
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			// Create authorized user
			user := &models.AuthorizedUser{
				ID: claims["sub"].(string),
			}

			// Add user to context
			ctx := context.WithValue(r.Context(), AuthUserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func isPublicPath(path string) bool {
	publicPaths := []string{
		"/auth/login/github",
		"/auth/callback/github",
		"/auth/refresh",
		"/check/name-conflict",
		"/check/yorkie",
	}

	for _, pp := range publicPaths {
		if strings.HasPrefix(path, pp) {
			return true
		}
	}
	return false
}
