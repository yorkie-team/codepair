package models

import (
	"time"
)

type WorkspaceDomain struct {

	// Workspace ID
	Id string `json:"id"`

	// Title of the workspace
	Title string `json:"title"`

	// Slug of the workspace
	Slug string `json:"slug"`

	// Timestamp of workspace creation
	CreatedAt time.Time `json:"createdAt"`

	// Timestamp of last workspace update
	UpdatedAt time.Time `json:"updatedAt"`
}
