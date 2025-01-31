package models

type RefreshTokenRequest struct {

	// Refresh token for requesting a new access token
	RefreshToken string `json:"refreshToken"`
}
