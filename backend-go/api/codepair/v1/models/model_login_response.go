package models

type LoginResponse struct {

	// Access token for CodePair
	AccessToken string `json:"accessToken"`

	// Refresh token to obtain new access tokens
	RefreshToken string `json:"refreshToken"`
}
