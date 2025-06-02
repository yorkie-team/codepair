package auth

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"golang.org/x/oauth2"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/core/users"
)

// Register creates a new handler for users endpoints and registers the routes.
func Register(e *echo.Echo, repo users.Repository) {
	conf := config.GetConfig()
	gConfig := &oauth2.Config{
		ClientID:     conf.OAuth.Github.ClientID,
		ClientSecret: conf.OAuth.Github.ClientSecret,
		RedirectURL:  conf.OAuth.Github.CallbackURL,
		Scopes:       []string{"read:user"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  conf.OAuth.Github.AuthorizationURL,
			TokenURL: conf.OAuth.Github.TokenURL,
		},
	}

	handler := &Handler{
		jwtGenerator:         jwt.NewGenerator(conf.JWT),
		userRepository:       repo,
		githubOAuthConfig:    gConfig,
		githubUserProfileURL: conf.OAuth.Github.UserProfileURL,
		frontendURL:          conf.OAuth.FrontendBaseURL,
	}

	e.GET("/auth/login/github", handler.githubLogin)
	e.GET("/auth/callback/github", handler.githubCallback)
	e.POST("/auth/refresh", handler.refreshToken)
}
