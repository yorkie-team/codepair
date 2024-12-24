package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type AuthHandler struct {
	userService *services.UserService
	config      *config.Config
}

func NewAuthHandler(userService *services.UserService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		config:      cfg,
	}
}

func (h *AuthHandler) GithubLogin(w http.ResponseWriter, r *http.Request) {
	redirectURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s",
		h.config.GithubClientID,
		h.config.GithubCallbackURL,
	)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) GithubCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}

	// Exchange code for access token
	token, err := h.userService.GetGithubAccessToken(code)
	if err != nil {
		http.Error(w, "Failed to get access token", http.StatusInternalServerError)
		return
	}

	// Get user info from GitHub
	githubUser, err := h.userService.GetGithubUser(token)
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}

	// Create or update user in our database
	user, err := h.userService.UpsertUser(githubUser)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := h.generateTokens(user)
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Redirect to frontend with tokens
	redirectURL := fmt.Sprintf(
		"%s/auth/callback?accessToken=%s&refreshToken=%s",
		h.config.FrontendBaseURL,
		accessToken,
		refreshToken,
	)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req models.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate refresh token
	token, err := jwt.Parse(req.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.config.JWTRefreshSecret), nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Generate new access token
	user := &models.User{
		ID:       claims["sub"].(string),
		Nickname: claims["nickname"].(string),
	}

	accessToken, err := h.generateAccessToken(user)
	if err != nil {
		http.Error(w, "Failed to generate access token", http.StatusInternalServerError)
		return
	}

	response := models.RefreshTokenResponse{
		AccessToken: accessToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) generateTokens(user *models.User) (string, string, error) {
	accessToken, err := h.generateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := h.generateRefreshToken(user)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (h *AuthHandler) generateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":      user.ID,
		"nickname": user.Nickname,
		"exp":      time.Now().Add(time.Hour * 1).Unix(),
	}
	return h.generateToken(claims, h.config.JWTAccessSecret)
}

func (h *AuthHandler) generateRefreshToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":      user.ID,
		"nickname": user.Nickname,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(),
	}
	return h.generateToken(claims, h.config.JWTRefreshSecret)
}

func (h *AuthHandler) generateToken(claims jwt.MapClaims, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
