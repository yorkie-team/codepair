package models

import (
	"time"
)

type CreateWorkspaceDocumentShareTokenRequest struct {

	// Share role for the document
	Role string `json:"role"`

	// Expiration timestamp for the share link
	ExpiredAt time.Time `json:"expiredAt"`
}
