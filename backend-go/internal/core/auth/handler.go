package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/core/users"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

const (
	githubProviderName = "github"
)

// githubUserResponse represents part of github api.
// https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
type githubUserResponse struct {
	ID string `json:"id"`
}

type Handler struct {
	jwtGenerator      *jwt.Generator
	userRepository    users.Repository
	githubOAuthConfig *oauth2.Config

	frontendURL          string
	githubUserProfileURL string
}

func (h *Handler) githubLogin(c echo.Context) error {
	// TODO(window9u): We should use a state parameter to prevent CSRF attacks.
	return c.Redirect(http.StatusTemporaryRedirect, h.githubOAuthConfig.AuthCodeURL(""))
}

func (h *Handler) githubCallback(c echo.Context) error {
	code := c.QueryParam("code")
	// TODO(window9u): We should add a validation logic for state parameter.
	oauthToken, err := h.exchangeGithubCode(c, code)
	if err != nil {
		return err
	}

	githubUserID, err := h.fetchGithubUserProfileID(c, oauthToken)
	if err != nil {
		return err
	}

	userID, err := h.userRepository.FindOrCreateUserBySocialID(githubProviderName, githubUserID)
	if err != nil {
		return middleware.NewError(
			http.StatusInternalServerError,
			"server internal error",
			fmt.Errorf("failed to find or create user by %s ID: %w", githubUserID, err),
		)
	}

	accessToken, refreshToken, err := h.generateAuthTokens(string(userID))
	if err != nil {
		return middleware.NewError(
			http.StatusInternalServerError,
			"server internal error",
			fmt.Errorf("failed to generate tokens %w", err),
		)
	}

	redirectURL, err := h.buildFrontendRedirectURL(accessToken, refreshToken)
	if err != nil {
		return middleware.NewError(
			http.StatusInternalServerError,
			"server internal error",
			fmt.Errorf("build frontend redirect url %w", err),
		)
	}

	return c.Redirect(http.StatusPermanentRedirect, redirectURL)
}

func (h *Handler) exchangeGithubCode(c echo.Context, code string) (*oauth2.Token, error) {
	ctx := c.Request().Context()
	oauthToken, err := h.githubOAuthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, middleware.NewError(http.StatusUnauthorized,
			"server internal error",
			fmt.Errorf("failed to exchange oauth code with github: %w", err),
		)
	}
	return oauthToken, nil
}

func (h *Handler) fetchGithubUserProfileID(c echo.Context, oauthToken *oauth2.Token) (string, error) {
	client := h.githubOAuthConfig.Client(c.Request().Context(), oauthToken)
	resp, err := client.Get(h.githubUserProfileURL)
	if err != nil {
		return "", middleware.NewError(
			http.StatusUnauthorized,
			"server internal error",
			fmt.Errorf("failed to get user profile from github: %w", err),
		)
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			fmt.Printf("error closing response body: %v\n", closeErr)
		}
	}()

	var profile githubUserResponse
	if err = json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return "", middleware.NewError(
			http.StatusUnauthorized,
			"server internal error",
			fmt.Errorf("failed to decode github user profile: %w", err),
		)
	}
	if profile.ID == "" {
		return "", middleware.NewError(
			http.StatusUnauthorized,
			"server internal error",
			fmt.Errorf("github user ID not found in profile: %w", err),
		)
	}
	return profile.ID, nil
}

func (h *Handler) generateAuthTokens(userID string) (accessToken string, refreshToken string, err error) {
	accessToken, err = h.jwtGenerator.GenerateAccessToken(userID)
	if err != nil {
		return "", "", fmt.Errorf("generate access token: %w", err)
	}

	refreshToken, err = h.jwtGenerator.GenerateRefreshToken(userID)
	if err != nil {
		return "", "", fmt.Errorf("generate refresh token: %w", err)
	}
	return accessToken, refreshToken, nil
}

func (h *Handler) buildFrontendRedirectURL(accessToken, refreshToken string) (string, error) {
	redirectURL, err := url.Parse(h.frontendURL)
	if err != nil {
		return "", fmt.Errorf("parse frontend URL: %w", err)
	}
	query := redirectURL.Query()
	query.Set("accessToken", accessToken)
	query.Set("refreshToken", refreshToken)
	redirectURL.RawQuery = query.Encode()
	return redirectURL.String(), nil
}

func (h *Handler) refreshToken(c echo.Context) error {
	var req models.RefreshTokenRequest
	if err := c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusUnauthorized, "invalid request")
	}

	if err := req.Validate(); err != nil {
		return middleware.NewError(http.StatusBadRequest, "invalid request")
	}

	userID, err := h.jwtGenerator.ParseRefreshToken(req.RefreshToken)
	if err != nil {
		return middleware.NewError(
			http.StatusUnauthorized,
			"server internal error",
			fmt.Errorf("failed to parse refresh token: %w", err),
		)
	}

	newAccessToken, err := h.jwtGenerator.GenerateAccessToken(userID)
	if err != nil {
		return middleware.NewError(
			http.StatusInternalServerError,
			"server internal error",
			fmt.Errorf("failed to generate new access token: %w", err),
		)
	}

	return c.JSON(http.StatusOK, models.RefreshTokenResponse{
		NewAccessToken: newAccessToken,
	})
}
