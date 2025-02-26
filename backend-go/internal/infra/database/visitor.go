package database

import (
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Visitor defines the interface for CRUD operations on visitor records.
type Visitor interface {
	// CreateVisitor creates a new visitor record.
	// It accepts a Visitor object and returns an error if creation fails.
	CreateVisitor(visitor entity.Visitor) (entity.Visitor, error)

	// FindVisitor retrieves a visitor record by its unique identifier.
	// It returns the Visitor and an error if the record cannot be found.
	FindVisitor(id entity.ID) (entity.Visitor, error)

	// UpdateVisitor updates an existing visitor record.
	// It accepts a Visitor object (including its ID) and returns an error if the update fails.
	UpdateVisitor(visitor entity.Visitor) error

	// DeleteVisitor removes a visitor record by its unique identifier.
	// It returns an error if the deletion operation fails.
	DeleteVisitor(id entity.ID) error
}
