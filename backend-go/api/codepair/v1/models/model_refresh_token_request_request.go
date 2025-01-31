package models

type RefreshTokenRequestRequest struct {

	// Refresh token for requesting a new access token
	RefreshToken string `json:"refreshToken"`
}
