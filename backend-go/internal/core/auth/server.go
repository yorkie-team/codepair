package auth

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/core/users"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"golang.org/x/oauth2"
)

// Register creates a new handler for users endpoints and registers the routes.
func Register(conf *config.Config, e *echo.Echo, repo users.Repository) {
	gConfig := &oauth2.Config{
		ClientID:     conf.OAuth.Github.ClientID,
		ClientSecret: conf.OAuth.Github.ClientSecret,
		RedirectURL:  conf.OAuth.Github.CallbackURL,
		Scopes:       []string{"user:public_profile"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  conf.OAuth.Github.AuthorizationURL,
			TokenURL: conf.OAuth.Github.TokenURL,
		},
	}

	svc := &Service{
		github:               gConfig,
		githubUserProfileURL: conf.OAuth.Github.UserProfileURL,
		jwtGenerator:         jwt.NewGenerator(conf.JWT),
		userRepository:       repo,
	}

	handler := &Handler{
		frontendURL: conf.OAuth.FrontendBaseURL,
		service:     svc,
	}

	e.GET("/auth/login/github", handler.githubLogin)
	e.GET("/auth/callback/github", handler.githubCallback)
	e.POST("/auth/refresh", handler.refreshToken)
}
