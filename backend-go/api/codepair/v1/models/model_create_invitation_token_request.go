package models

import (
	"time"
)

type CreateInvitationTokenRequest struct {

	// Expiration timestamp for the invitation token
	ExpiredAt time.Time `json:"expiredAt"`
}
