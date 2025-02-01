package models

import (
	"time"
)

type FindUserResponse struct {

	// User ID
	Id string `json:"id"`

	// User nickname
	Nickname string `json:"nickname,omitempty"`

	// Last accessed workspace slug
	LastWorkspaceSlug string `json:"lastWorkspaceSlug,omitempty"`

	// Timestamp of user creation
	CreatedAt time.Time `json:"createdAt"`

	// Timestamp of last user update
	UpdatedAt time.Time `json:"updatedAt"`
}
