package services

import (
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
)

type AuthService struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		cfg:        cfg,
		httpClient: &http.Client{},
	}
}

func (s *AuthService) GetGithubAuthURL() string {
	return fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&scope=user",
		s.cfg.GithubClientID,
	)
}

func (s *AuthService) HandleGithubCallback(code string) (*models.TokenResponse, error) {
	// Exchange code for access token
	githubToken, err := s.exchangeCodeForToken(code)
	if err != nil {
		return nil, err
	}

	// Get user info from GitHub
	user, err := s.getGithubUser(githubToken)
	if err != nil {
		return nil, err
	}

	// Generate JWT tokens
	accessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*models.TokenResponse, error) {
	// Validate refresh token
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(claims.Subject)
	if err != nil {
		return nil, err
	}

	return &models.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) generateAccessToken(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) generateRefreshToken(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

// Helper methods for GitHub OAuth flow
func (s *AuthService) exchangeCodeForToken(code string) (string, error) {
	// Implementation for GitHub OAuth token exchange
	return "", nil
}

func (s *AuthService) getGithubUser(token string) (*models.GithubUser, error) {
	// Implementation for getting GitHub user info
	return nil, nil
}
