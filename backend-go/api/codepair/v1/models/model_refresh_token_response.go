package models

type RefreshTokenResponse struct {

	// The newly issued access token
	NewAccessToken string `json:"newAccessToken"`
}
