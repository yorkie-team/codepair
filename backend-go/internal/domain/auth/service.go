package auth

import (
	"fmt"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth/dto"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	cfg        *config.GithubConfig
	httpClient *http.Client
}

func NewService(cfg *config.GithubConfig) *Service {
	return &Service{
		cfg:        cfg,
		httpClient: &http.Client{},
	}
}

func (s *Service) GetGithubAuthURL() string {
	return fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&scope=user",
		s.cfg.ClientID,
	)
}

func (s *Service) HandleGithubCallback(code string) (*dto.GithubAccessTokenResponse, error) {
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

	return &dto.GithubAccessTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) RefreshToken(refreshToken string) (*models2.TokenResponse, error) {
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

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) generateAccessToken(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *Service) generateRefreshToken(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

// Helper methods for GitHub OAuth flow
func (s *Service) exchangeCodeForToken(code string) (string, error) {
	// Implementation for GitHub OAuth token exchange
	return "", nil
}

func (s *Service) getGithubUser(token string) (*dto.GithubUser, error) {
	// Implementation for getting GitHub user info
	return nil, nil
}
