package hello

import (
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
)

// Repository defines the interface for CRUD operations on visitor records.
type Repository interface {
	// CreateVisitor creates a new visitor record.
	// It accepts a Repository object and returns an error if creation fails.
	CreateVisitor(visitor entity.Visitor) (entity.Visitor, error)

	// FindVisitor retrieves a visitor record by its unique identifier.
	// It returns the Repository and an error if the record cannot be found.
	FindVisitor(id entity.ID) (entity.Visitor, error)

	// UpdateVisitor updates an existing visitor record.
	// It accepts a Repository object (including its ID) and returns an error if the update fails.
	UpdateVisitor(visitor entity.Visitor) error

	// DeleteVisitor removes a visitor record by its unique identifier.
	// It returns an error if the deletion operation fails.
	DeleteVisitor(id entity.ID) error
}
