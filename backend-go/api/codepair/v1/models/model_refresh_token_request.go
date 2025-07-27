package models

import "fmt"

type RefreshTokenRequest struct {

	// Refresh token for requesting a new access token
	RefreshToken string `json:"refreshToken"`
}

func (r *RefreshTokenRequest) Validate() error {
	if r.RefreshToken == "" {
		return fmt.Errorf("refresh token is required")
	}
	return nil
}
