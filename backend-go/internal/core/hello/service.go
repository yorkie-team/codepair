package hello

import (
	"errors"
	"fmt"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

// Service provides business logic for handling hello messages.
type Service struct {
	repo database.Hello
}

// createHello creates a new visitor record based on the provided hello request.
func (s *Service) createHello(req *models.HelloRequest) (string, error) {
	visitor := database.Visitor{
		Nickname: req.Nickname,
	}
	visitor, err := s.repo.CreateVisitor(visitor)
	if err != nil {
		if errors.Is(err, database.ErrDuplicatedKey) {
			return "", fmt.Errorf("nickname '%s' already exists: %w", req.Nickname, err)
		}
		return "", fmt.Errorf("failed to create hello message for visitor %v: %w", req, err)
	}
	return string(visitor.ID), nil
}

// readNickname retrieves the nickname of a visitor record by its unique identifier.
func (s *Service) readNickname(id string) (string, error) {
	visitor, err := s.repo.FindVisitor(database.ID(id))
	if err != nil {
		if errors.Is(err, database.ErrDocumentNotFound) {
			return "", fmt.Errorf("visitor with ID '%s' not found: %w", id, err)
		}
		return "", fmt.Errorf("failed to find hello message for ID %s: %w", id, err)
	}
	return visitor.Nickname, nil
}

// updateHello updates an existing visitor record with new data from the hello request.
func (s *Service) updateHello(id string, req *models.HelloRequest) error {
	visitor := database.Visitor{
		ID:       database.ID(id),
		Nickname: req.Nickname,
	}

	if err := s.repo.UpdateVisitor(visitor); err != nil {
		if errors.Is(err, database.ErrDocumentNotFound) {
			return fmt.Errorf("cannot update: visitor with ID '%s' not found: %w", id, err)
		}
		return fmt.Errorf("failed to update hello message for visitor with ID %s: %w", id, err)
	}
	return nil
}

// deleteHello removes a visitor record by its unique identifier.
func (s *Service) deleteHello(id string) error {
	if err := s.repo.DeleteVisitor(database.ID(id)); err != nil {
		if errors.Is(err, database.ErrDocumentNotFound) {
			return fmt.Errorf("cannot delete: visitor with ID '%s' not found: %w", id, err)
		}
		return fmt.Errorf("failed to delete hello message for visitor with ID %s: %w", id, err)
	}
	return nil
}
