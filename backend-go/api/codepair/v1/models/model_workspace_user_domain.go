package models

import (
	"time"
)

type WorkspaceUserDomain struct {

	// User ID
	Id string `json:"id"`

	// User nickname
	Nickname string `json:"nickname"`

	// Timestamp of user creation
	CreatedAt time.Time `json:"createdAt"`

	// Timestamp of last user update
	UpdatedAt time.Time `json:"updatedAt"`
}
