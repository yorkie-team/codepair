package auth

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"

	"github.com/yorkie-team/codepair/backend/internal/core/users"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Service provides business logic for handling hello messages.
type Service struct {
	github               *oauth2.Config
	githubUserProfileURL string

	jwtGenerator *jwt.Generator

	userRepository users.Repository
}

func (s *Service) githubAuthURL() string {
	// TODO(window9u): after migration, consider use state to prevent CSRF
	return s.github.AuthCodeURL("")
}

func (s *Service) githubCallback(c echo.Context, code string) (string, string, error) {
	ctx := context.Background()
	oauthToken, err := s.github.Exchange(ctx, code)
	if err != nil {
		return "", "", middleware.NewError(http.StatusUnauthorized, "exchange token with github", err)
	}

	cli := s.github.Client(ctx, oauthToken)
	resp, err := cli.Get(s.githubUserProfileURL)
	if err != nil {
		return "", "", middleware.NewError(http.StatusUnauthorized, "get user profile", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			c.Logger().Error("failed to close response body", err)
		}
	}()

	// NOTE(window9u): reference this for parse body
	// https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
	body := struct {
		ID string `json:"id"`
	}{}

	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", "", middleware.NewError(http.StatusUnauthorized, "decode user profile", err)
	}

	id, err := s.userRepository.FindOrCreateUserBySocialID("github", body.ID)
	if err != nil {
		return "", "", middleware.NewError(http.StatusUnauthorized, "create user by github", err)
	}

	access, err := s.jwtGenerator.GenerateAccessToken(string(id))
	if err != nil {
		return "", "", middleware.NewError(http.StatusInternalServerError, "generate access token", err)
	}

	refresh, err := s.jwtGenerator.GenerateRefreshToken(string(id))
	if err != nil {
		return "", "", middleware.NewError(http.StatusInternalServerError, "generate refresh token", err)
	}

	return access, refresh, nil
}

func (s *Service) generateAccessToken(refreshToken string) (string, error) {
	id, err := s.jwtGenerator.ParseRefreshToken(refreshToken)
	if err != nil {
		return "", middleware.NewError(http.StatusUnauthorized, "parse refresh token", err)
	}
	accessToken, err := s.jwtGenerator.GenerateAccessToken(id)
	if err != nil {
		return "", middleware.NewError(http.StatusInternalServerError, "generate access token", err)
	}
	return accessToken, nil
}
