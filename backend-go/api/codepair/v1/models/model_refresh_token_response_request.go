package models

type RefreshTokenResponseRequest struct {

	// The newly issued access token
	NewAccessToken string `json:"newAccessToken"`
}
